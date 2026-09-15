"use client";

import { localDb, type SyncQueueItem, type OfflineVisitor } from "@/lib/offline-db";
import { getAuthHeaders } from "@/lib/client-auth";
import { supabase } from "@/lib/supabase";
import type { Visitor } from "@/types/guard";

export interface SyncQueueResult {
  syncedCount: number;
  failedCount: number;
  errors: any[];
}

/**
 * Reads all records from the Dexie sync_queue.
 * For each record, executes the corresponding API call wrapped in robust try/catch.
 * On a successful (200 OK) response, deletes that specific record from the local sync_queue.
 * If the response is a hard error (400, 401, 403, 404, etc.) OR if network failure / 5xx error
 * happens and retryCount >= 3:
 *   Updates the record in Dexie to status: 'failed' and saves the error message,
 *   so it stops being processed in the pending loop.
 */
export async function syncQueueToServer(): Promise<SyncQueueResult> {
  if (!localDb) {
    return { syncedCount: 0, failedCount: 0, errors: [] };
  }

  // If currently offline, skip attempting sync
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { syncedCount: 0, failedCount: 0, errors: ["Device is offline"] };
  }

  const pendingRecords = await localDb.sync_queue
    .where("status")
    .equals("pending")
    .sortBy("timestamp");

  let syncedCount = 0;
  let failedCount = 0;
  const errors: any[] = [];

  for (const record of pendingRecords) {
    if (!record.id) continue;

    try {
      await localDb.sync_queue.update(record.id, { status: "syncing" });

      let response: Response | null = null;
      let networkError: any = null;

      // Wrap the API fetch calls in a robust try/catch
      try {
        if (record.action === "confirm_entry" || record.action === "direct_approve") {
          const headers = await getAuthHeaders(true);
          response = await fetch("/api/guard/visitors/confirm-pre-registered", {
            method: "POST",
            headers,
            body: JSON.stringify(record.payload),
          });
        } else if (record.action === "register_walk_in") {
          response = await fetch("/api/visitors/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record.payload),
          });
        } else if (record.action === "checkout") {
          const headers = await getAuthHeaders(true);
          response = await fetch("/api/visitor-pass/checkout", {
            method: "POST",
            headers,
            body: JSON.stringify(record.payload),
          });
        }
      } catch (fetchErr: any) {
        networkError = fetchErr;
      }

      // 1. Success case: response.ok is true
      if (response && response.ok) {
        // If register_walk_in returned new ID, handle temporary ID swap
        if (record.action === "register_walk_in") {
          try {
            const resultJson = await response.json().catch(() => ({}));
            if (resultJson.data?.id && record.visitorId !== resultJson.data.id) {
              await localDb.visitors.delete(record.visitorId);
              await localDb.visitors.put({
                ...resultJson.data,
                cached_at: Date.now(),
              });
            }
          } catch (swapErr) {
            console.warn("[SyncManager] Failed to swap offline visitor ID:", swapErr);
          }
        }

        // Delete the item from the queue as usual
        await localDb.sync_queue.delete(record.id);
        syncedCount++;
        continue;
      }

      // 2. Failure cases:
      let errorMessage = "Unknown sync error";
      let isHardError = false;

      if (response) {
        const errData = await response.json().catch(() => ({}));
        errorMessage = errData.error || `Server responded with ${response.status}`;
        // Hard errors: 400, 401, 403, 404, or any client 4xx error
        isHardError = response.status >= 400 && response.status < 500;
      } else if (networkError) {
        errorMessage = networkError?.message || "Network request failed";
      }

      const nextRetryCount = (record.retryCount || 0) + 1;
      const shouldMarkFailed = isHardError || nextRetryCount >= 3;

      if (shouldMarkFailed) {
        // Update the record in Dexie to status: 'failed' and save error message
        await localDb.sync_queue.update(record.id, {
          status: "failed",
          retryCount: nextRetryCount,
          error: errorMessage,
        });
      } else {
        // Transient error with retries remaining, put back to 'pending'
        await localDb.sync_queue.update(record.id, {
          status: "pending",
          retryCount: nextRetryCount,
          error: errorMessage,
        });
      }

      failedCount++;
      errors.push(new Error(errorMessage));

      // Break if device lost connectivity mid-sync
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        break;
      }
    } catch (unexpectedErr: any) {
      console.error("[SyncManager] Unexpected error syncing queue record:", record, unexpectedErr);
      const nextRetryCount = (record.retryCount || 0) + 1;
      const shouldMarkFailed = nextRetryCount >= 3;

      await localDb.sync_queue.update(record.id, {
        status: shouldMarkFailed ? "failed" : "pending",
        retryCount: nextRetryCount,
        error: unexpectedErr?.message || String(unexpectedErr),
      });

      failedCount++;
      errors.push(unexpectedErr);

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        break;
      }
    }
  }

  return { syncedCount, failedCount, errors };
}

/**
 * Deletes all records from Dexie sync_queue whose status is 'failed'.
 */
export async function clearFailedSyncs(): Promise<number> {
  if (!localDb) return 0;
  try {
    const failedItems = await localDb.sync_queue
      .where("status")
      .equals("failed")
      .toArray();

    const ids = failedItems
      .map((item) => item.id)
      .filter((id): id is number => typeof id === "number");

    if (ids.length > 0) {
      await localDb.sync_queue.bulkDelete(ids);
    }
    return ids.length;
  } catch (err) {
    console.warn("[SyncManager] Failed to clear failed sync items:", err);
    return 0;
  }
}

/**
 * Returns count of items in sync_queue with status 'failed'.
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
 * Fetches today's active and pre-registered visitors from Supabase / API.
 * Uses db.visitors.bulkPut() to update the local IndexedDB.
 */
export async function refreshLocalCache(companyId?: string | null): Promise<Visitor[]> {
  if (!localDb) return [];

  // If offline, return currently cached records
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    if (companyId) {
      return localDb.visitors.where("company_id").equals(companyId).toArray();
    }
    return localDb.visitors.toArray();
  }

  try {
    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", authData.user.id)
          .single();
        targetCompanyId = profile?.company_id || null;
      }
    }

    if (!targetCompanyId) return [];

    // Fetch decrypted and formatted active guard visitors from the API endpoint
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/guard/visitors?company_id=${targetCompanyId}`, {
      headers,
    });

    let visitors: Visitor[] = [];

    if (response.ok) {
      const result = await response.json().catch(() => ({}));
      visitors = (result.data || []) as Visitor[];
    } else {
      // Fallback: query Supabase directly for active and pre-registered visitors
      const { data, error } = await supabase
        .from("visitors")
        .select("*")
        .eq("company_id", targetCompanyId)
        .in("status", ["pending", "checked_in", "pre_registered"]);

      if (!error && data) {
        visitors = data as Visitor[];
      }
    }

    if (visitors.length > 0) {
      const now = Date.now();
      const offlineVisitors: OfflineVisitor[] = visitors.map((v) => ({
        ...v,
        cached_at: now,
      }));
      // db.visitors.bulkPut() to update the local IndexedDB
      await localDb.visitors.bulkPut(offlineVisitors);
    }

    return visitors;
  } catch (error) {
    console.warn("[SyncManager] Failed to refresh local cache:", error);
    if (companyId) {
      return localDb.visitors.where("company_id").equals(companyId).toArray();
    }
    return localDb.visitors.toArray();
  }
}

/**
 * Deletes any visitors in the local Dexie visitors store whose
 * expected_arrival or created_at is older than 24 hours.
 */
export async function clearStaleData(): Promise<number> {
  if (!localDb) return 0;

  try {
    const twentyFourHoursAgoMs = Date.now() - 24 * 60 * 60 * 1000;
    const allVisitors = await localDb.visitors.toArray();

    // Check which visitors are currently pending sync so we NEVER delete unsynced work
    const pendingItems = await localDb.sync_queue.toArray();
    const pendingVisitorIds = new Set(pendingItems.map((item) => item.visitorId));

    const staleIds: string[] = [];

    for (const visitor of allVisitors) {
      // Never delete an item that is still waiting to sync to the server
      if (pendingVisitorIds.has(visitor.id)) {
        continue;
      }

      const createdAtMs = visitor.created_at ? new Date(visitor.created_at).getTime() : 0;
      const expectedArrivalMs = visitor.expected_arrival ? new Date(visitor.expected_arrival).getTime() : 0;

      // Use expected_arrival if defined, otherwise fall back to created_at
      const visitorTime = expectedArrivalMs > 0 ? expectedArrivalMs : createdAtMs;

      if (visitorTime > 0 && visitorTime < twentyFourHoursAgoMs) {
        staleIds.push(visitor.id);
      }
    }

    if (staleIds.length > 0) {
      await localDb.visitors.bulkDelete(staleIds);
    }

    return staleIds.length;
  } catch (error) {
    console.warn("[SyncManager] Failed to clear stale data:", error);
    return 0;
  }
}

