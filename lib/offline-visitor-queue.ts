export type OfflineVisitorPayload = {
  company_id: string;
  name: string;
  phone: string;
  document_type: string | null;
  id_number: string | null;
  host_id: string | null;
  host_name: string | null;
  purpose: string | null;
  vehicle_reg: string | null;
  photo_url: string | null;
  custom_data: Record<string, string>;
  gate_id: string | null;
};

export type OfflineVisitorRecord = {
  id: string;
  payload: OfflineVisitorPayload;
  createdAt: string;
  updatedAt: string;
  syncStatus: "pending" | "syncing" | "synced" | "failed";
  attempts: number;
  lastError?: string | null;
};

const DB_NAME = "karibu-vms-offline";
const DB_VERSION = 1;
const STORE_NAME = "visitor-registration-queue";

function isBrowser() {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function createOfflineId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `offline-${crypto.randomUUID()}`;
  }
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      reject(new Error("Offline storage is not available in this browser."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open offline storage."));
  });
}

function runStoreTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  return openOfflineDb().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        let request: IDBRequest<T> | void;

        transaction.oncomplete = () => {
          db.close();
          resolve(request ? request.result : undefined);
        };
        transaction.onerror = () => {
          db.close();
          reject(transaction.error || new Error("Offline storage transaction failed."));
        };
        transaction.onabort = () => {
          db.close();
          reject(transaction.error || new Error("Offline storage transaction was aborted."));
        };

        request = operation(store);
      }),
  );
}

export async function enqueueOfflineVisitor(payload: OfflineVisitorPayload) {
  const now = new Date().toISOString();
  const record: OfflineVisitorRecord = {
    id: createOfflineId(),
    payload,
    createdAt: now,
    updatedAt: now,
    syncStatus: "pending",
    attempts: 0,
    lastError: null,
  };

  await runStoreTransaction("readwrite", (store) => store.add(record));
  return record;
}

export async function getPendingOfflineVisitors() {
  const records = await runStoreTransaction<OfflineVisitorRecord[]>("readonly", (store) => store.getAll());
  return (records || []).filter((record) => record.syncStatus === "pending" || record.syncStatus === "failed");
}

export async function updateOfflineVisitorRecord(id: string, updates: Partial<OfflineVisitorRecord>) {
  await runStoreTransaction("readwrite", (store) => {
    const getRequest = store.get(id) as IDBRequest<OfflineVisitorRecord | undefined>;
    getRequest.onsuccess = () => {
      const existing = getRequest.result;
      if (!existing) return;
      store.put({
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    };
  });
}

export async function deleteOfflineVisitorRecord(id: string) {
  await runStoreTransaction("readwrite", (store) => store.delete(id));
}

export async function countPendingOfflineVisitors() {
  const records = await getPendingOfflineVisitors();
  return records.length;
}

export async function syncPendingOfflineVisitors() {
  if (!isBrowser() || !navigator.onLine) return { synced: 0, failed: 0 };

  const pendingRecords = await getPendingOfflineVisitors();
  let synced = 0;
  let failed = 0;

  for (const record of pendingRecords) {
    try {
      await updateOfflineVisitorRecord(record.id, {
        syncStatus: "syncing",
        attempts: record.attempts + 1,
        lastError: null,
      });

      const response = await fetch("/api/visitors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...record.payload,
          custom_data: {
            ...record.payload.custom_data,
            offline_record_id: record.id,
            offline_created_at: record.createdAt,
            source: record.payload.custom_data?.source || "offline_queue",
          },
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Cloud sync failed.");
      }

      await deleteOfflineVisitorRecord(record.id);
      synced += 1;
    } catch (error) {
      failed += 1;
      await updateOfflineVisitorRecord(record.id, {
        syncStatus: "failed",
        attempts: record.attempts + 1,
        lastError: error instanceof Error ? error.message : "Cloud sync failed.",
      });
    }
  }

  return { synced, failed };
}
