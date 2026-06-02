const CACHE_NAME = "karibu-vms-v2";
const OFFLINE_DB_NAME = "karibu-vms-offline";
const OFFLINE_DB_VERSION = 1;
const OFFLINE_STORE_NAME = "visitor-registration-queue";
const APP_SHELL_URLS = [
  "/",
  "/favicon.svg",
  "/logo.svg",
  "/manifest.webmanifest",
];

function openOfflineDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OFFLINE_STORE_NAME)) {
        const store = db.createObjectStore(OFFLINE_STORE_NAME, { keyPath: "id" });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open offline storage."));
  });
}

function createOfflineId() {
  if (self.crypto && "randomUUID" in self.crypto) {
    return `offline-${self.crypto.randomUUID()}`;
  }
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function enqueueOfflineVisitor(payload) {
  const db = await openOfflineDb();
  const now = new Date().toISOString();
  const record = {
    id: createOfflineId(),
    payload,
    createdAt: now,
    updatedAt: now,
    syncStatus: "pending",
    attempts: 0,
    lastError: null,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OFFLINE_STORE_NAME, "readwrite");
    const store = transaction.objectStore(OFFLINE_STORE_NAME);
    store.add(record);

    transaction.oncomplete = () => {
      db.close();
      resolve(record);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error("Failed to save offline visitor."));
    };
  });
}

async function getOfflineRecords() {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OFFLINE_STORE_NAME, "readonly");
    const store = transaction.objectStore(OFFLINE_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error("Failed to read offline visitors."));
    transaction.oncomplete = () => db.close();
  });
}

async function updateOfflineRecord(id, updates) {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OFFLINE_STORE_NAME, "readwrite");
    const store = transaction.objectStore(OFFLINE_STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result;
      if (!existing) return;
      store.put({ ...existing, ...updates, updatedAt: new Date().toISOString() });
    };

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error("Failed to update offline visitor."));
    };
  });
}

async function deleteOfflineRecord(id) {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OFFLINE_STORE_NAME, "readwrite");
    transaction.objectStore(OFFLINE_STORE_NAME).delete(id);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error("Failed to delete offline visitor."));
    };
  });
}

async function syncOfflineVisitors() {
  const records = await getOfflineRecords();
  const pendingRecords = records.filter((record) => record.syncStatus === "pending" || record.syncStatus === "failed");

  for (const record of pendingRecords) {
    try {
      await updateOfflineRecord(record.id, {
        syncStatus: "syncing",
        attempts: (record.attempts || 0) + 1,
        lastError: null,
      });

      const response = await fetch("/api/visitors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...record.payload,
          custom_data: {
            ...(record.payload.custom_data || {}),
            offline_record_id: record.id,
            offline_created_at: record.createdAt,
            source: record.payload.custom_data?.source || "offline_queue",
          },
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Cloud sync failed.");

      await deleteOfflineRecord(record.id);
    } catch (error) {
      await updateOfflineRecord(record.id, {
        syncStatus: "failed",
        attempts: (record.attempts || 0) + 1,
        lastError: error instanceof Error ? error.message : "Cloud sync failed.",
      });
    }
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_URLS)).finally(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim())
      .then(() => syncOfflineVisitors().catch(() => undefined)),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SYNC_OFFLINE_VISITORS") {
    event.waitUntil(syncOfflineVisitors().catch(() => undefined));
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-visitors") {
    event.waitUntil(syncOfflineVisitors());
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method === "POST" && url.pathname === "/api/visitors/register") {
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        const payload = await request.clone().json();
        const offlineRecord = await enqueueOfflineVisitor(payload);

        if (self.registration.sync) {
          await self.registration.sync.register("sync-offline-visitors").catch(() => undefined);
        }

        return new Response(
          JSON.stringify({
            data: {
              id: offlineRecord.id,
              status: "pending_cloud_sync",
              offline: true,
              passUrl: null,
              passToken: null,
              qrPassEnabled: false,
            },
            message: "Visitor saved offline and will sync when connection returns.",
          }),
          {
            status: 202,
            headers: { "Content-Type": "application/json" },
          },
        );
      }),
    );
    return;
  }

  if (request.method !== "GET") {
    return;
  }

  if (url.origin === self.location.origin && request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (url.origin === self.location.origin) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
