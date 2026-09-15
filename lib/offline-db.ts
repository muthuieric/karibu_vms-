"use client";

import Dexie, { type Table } from "dexie";
import type { Visitor } from "@/types/guard";
import { getAuthHeaders } from "@/lib/client-auth";

export interface OfflineVisitor extends Visitor {
  cached_at?: number;
  is_offline_created?: boolean;
}

export interface SyncQueueItem {
  id?: number;
  visitorId: string;
  action: "confirm_entry" | "direct_approve" | "register_walk_in" | "checkout";
  payload: any;
  timestamp: number;
  status: "pending" | "syncing" | "failed";
  retryCount: number;
  error?: string;
}

export class KaribuLocalDatabase extends Dexie {
  visitors!: Table<OfflineVisitor, string>;
  sync_queue!: Table<SyncQueueItem, number>;

  constructor() {
    super("KaribuLocalDB");
    this.version(1).stores({
      visitors: "id, name, phone, id_number, host_name, expected_arrival, status, company_id, gate_id, created_at, cached_at",
      sync_queue: "++id, visitorId, action, status, timestamp, retryCount",
    });
  }
}

export const localDb = typeof window !== "undefined" ? new KaribuLocalDatabase() : null;

/**
 * Cache visitors fetched from online API into IndexedDB.
 */
export async function cacheVisitors(visitors: Visitor[]): Promise<void> {
  if (!localDb || !visitors.length) return;
  try {
    const timestamp = Date.now();
    const offlineVisitors: OfflineVisitor[] = visitors.map((v) => ({
      ...v,
      cached_at: timestamp,
    }));
    await localDb.visitors.bulkPut(offlineVisitors);
  } catch (error) {
    console.warn("[OfflineDB] Failed to cache visitors:", error);
  }
}

/**
 * Retrieve cached visitors for a company, sorted by created_at descending.
 */
export async function getCachedVisitors(companyId?: string | null): Promise<Visitor[]> {
  if (!localDb) return [];
  try {
    let collection = localDb.visitors.toCollection();
    if (companyId) {
      collection = localDb.visitors.where("company_id").equals(companyId);
    }
    const items = await collection.toArray();
    // Sort recent first
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.warn("[OfflineDB] Failed to retrieve cached visitors:", error);
    return [];
  }
}

/**
 * Optimistically mark visitor as checked in within the local IndexedDB.
 */
export async function markVisitorCheckedInLocally(visitorId: string, checkedInAt?: string): Promise<void> {
  if (!localDb) return;
  try {
    const now = checkedInAt || new Date().toISOString();
    await localDb.visitors.update(visitorId, {
      status: "checked_in",
      checked_in_at: now,
    });
  } catch (error) {
    console.warn("[OfflineDB] Failed to update visitor locally:", error);
  }
}

/**
 * Optimistically mark visitor as checked out within the local IndexedDB.
 */
export async function markVisitorCheckedOutLocally(visitorId: string): Promise<void> {
  if (!localDb) return;
  try {
    await localDb.visitors.update(visitorId, {
      status: "checked_out",
    });
  } catch (error) {
    console.warn("[OfflineDB] Failed to update visitor locally:", error);
  }
}

/**
 * Save an offline-created walk-in visitor to IndexedDB.
 */
export async function saveOfflineWalkInVisitor(visitor: OfflineVisitor): Promise<void> {
  if (!localDb) return;
  try {
    await localDb.visitors.put(visitor);
  } catch (error) {
    console.warn("[OfflineDB] Failed to save offline walk-in visitor:", error);
  }
}

/**
 * Enqueue an action to be synchronized when connectivity is restored.
 */
export async function enqueueSyncAction(
  action: SyncQueueItem["action"],
  visitorId: string,
  payload: any
): Promise<number | undefined> {
  if (!localDb) return;
  try {
    const item: SyncQueueItem = {
      visitorId,
      action,
      payload,
      timestamp: Date.now(),
      status: "pending",
      retryCount: 0,
    };
    return await localDb.sync_queue.add(item);
  } catch (error) {
    console.warn("[OfflineDB] Failed to enqueue sync action:", error);
  }
}

/**
 * Get count of pending actions awaiting synchronization.
 */
export async function getPendingSyncCount(): Promise<number> {
  if (!localDb) return 0;
  try {
    return await localDb.sync_queue.where("status").equals("pending").count();
  } catch {
    return 0;
  }
}

/**
 * Get count of failed actions in the sync queue.
 */
export async function getFailedSyncCount(): Promise<number> {
  if (!localDb) return 0;
  try {
    return await localDb.sync_queue.where("status").equals("failed").count();
  } catch {
    return 0;
  }
}

/**
 * Delete all failed sync actions from the local queue.
 */
export async function clearFailedSyncActions(): Promise<number> {
  if (!localDb) return 0;
  try {
    const failedItems = await localDb.sync_queue.where("status").equals("failed").toArray();
    const ids = failedItems.map((item) => item.id).filter((id): id is number => typeof id === "number");
    if (ids.length > 0) {
      await localDb.sync_queue.bulkDelete(ids);
    }
    return ids.length;
  } catch (error) {
    console.warn("[OfflineDB] Failed to clear failed sync actions:", error);
    return 0;
  }
}

/**
 * Flush all pending sync items to the remote APIs.
 */
export async function flushSyncQueue(
  onItemSynced?: (item: SyncQueueItem, success: boolean) => void
): Promise<{ syncedCount: number; errors: any[] }> {
  if (!localDb) return { syncedCount: 0, errors: [] };

  const pendingItems = await localDb.sync_queue
    .where("status")
    .equals("pending")
    .sortBy("timestamp");

  let syncedCount = 0;
  const errors: any[] = [];

  for (const item of pendingItems) {
    if (!item.id) continue;

    try {
      await localDb.sync_queue.update(item.id, { status: "syncing" });
      let success = false;

      if (item.action === "confirm_entry") {
        const headers = await getAuthHeaders(true);
        const res = await fetch("/api/guard/visitors/confirm-pre-registered", {
          method: "POST",
          headers,
          body: JSON.stringify(item.payload),
        });
        success = res.ok;
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          // If already checked in or 404, don't keep blocking queue
          if (res.status === 400 || res.status === 404 || res.status === 409) {
            success = true;
          } else {
            throw new Error(errData.error || "Failed to sync check-in.");
          }
        }
      } else if (item.action === "direct_approve") {
        const headers = await getAuthHeaders(true);
        const res = await fetch("/api/guard/visitors/confirm-pre-registered", {
          method: "POST",
          headers,
          body: JSON.stringify(item.payload),
        });
        success = res.ok || res.status === 400 || res.status === 409;
      } else if (item.action === "register_walk_in") {
        const res = await fetch("/api/visitors/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error || "Failed to sync offline walk-in registration.");
        }
        success = true;

        // If local visitor had temporary offline ID, replace with real record
        if (json.data && json.data.id && item.visitorId !== json.data.id) {
          try {
            await localDb.visitors.delete(item.visitorId);
            await localDb.visitors.put(json.data);
          } catch {
            // Ignore key swap error
          }
        }
      } else if (item.action === "checkout") {
        const headers = await getAuthHeaders(true);
        const res = await fetch("/api/visitor-pass/checkout", {
          method: "POST",
          headers,
          body: JSON.stringify(item.payload),
        });
        success = res.ok || res.status === 400 || res.status === 404;
      }

      if (success) {
        await localDb.sync_queue.delete(item.id);
        syncedCount++;
        onItemSynced?.(item, true);
      } else {
        await localDb.sync_queue.update(item.id, {
          status: "failed",
          retryCount: item.retryCount + 1,
        });
        onItemSynced?.(item, false);
      }
    } catch (err: any) {
      console.error("[OfflineDB] Error syncing queue item:", item, err);
      errors.push(err);
      await localDb.sync_queue.update(item.id, {
        status: "pending",
        retryCount: item.retryCount + 1,
        error: err?.message || String(err),
      });
      onItemSynced?.(item, false);
      // Stop loop if offline again
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        break;
      }
    }
  }

  return { syncedCount, errors };
}

