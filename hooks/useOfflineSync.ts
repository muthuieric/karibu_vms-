"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  syncQueueToServer,
  refreshLocalCache,
  clearStaleData,
  clearFailedSyncs,
  type SyncQueueResult,
} from "@/lib/sync-manager";
import { getPendingSyncCount, getFailedSyncCount } from "@/lib/offline-db";
import type { Visitor } from "@/types/guard";

export interface UseOfflineSyncOptions {
  companyId?: string | null;
  onSynced?: (visitors: Visitor[]) => void;
  syncIntervalMs?: number; // Defaults to 5 minutes (300,000ms)
}

export function useOfflineSync({
  companyId,
  onSynced,
  syncIntervalMs = 5 * 60 * 1000,
}: UseOfflineSyncOptions = {}) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);

  const isSyncingRef = useRef(false);
  const onSyncedRef = useRef(onSynced);
  onSyncedRef.current = onSynced;

  // Refresh pending queue item count (only counting status === 'pending') and failed count
  const refreshCounts = useCallback(async () => {
    try {
      const [pending, failed] = await Promise.all([
        getPendingSyncCount(),
        getFailedSyncCount(),
      ]);
      setPendingCount(pending);
      setFailedCount(failed);
      return { pending, failed };
    } catch {
      return { pending: 0, failed: 0 };
    }
  }, []);

  /**
   * Complete synchronization flow:
   * 1. Clear stale data older than 24h
   * 2. If online, flush pending sync_queue records to server
   * 3. If online, refresh local cache with today's active/pre-registered visitors
   * 4. Update lastSynced timestamp
   * 5. Always reset isSyncing to false in finally {}
   */
  const syncNow = useCallback(async (): Promise<{
    syncResult?: SyncQueueResult;
    visitors?: Visitor[];
    staleRemoved?: number;
  }> => {
    if (isSyncingRef.current) return {};
    isSyncingRef.current = true;
    setIsSyncing(true);

    let syncResult: SyncQueueResult | undefined;
    let freshVisitors: Visitor[] | undefined;
    let staleRemoved = 0;

    try {
      // 1. Clear stale data older than 24 hours
      staleRemoved = await clearStaleData();

      const currentlyOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      setIsOnline(currentlyOnline);

      if (currentlyOnline) {
        // 2. Read records from Dexie sync_queue and post to server
        syncResult = await syncQueueToServer();

        // 3. Fetch latest active and pre-registered visitors to update Dexie
        freshVisitors = await refreshLocalCache(companyId);

        setLastSynced(new Date());
        onSyncedRef.current?.(freshVisitors);
      }

      return { syncResult, visitors: freshVisitors, staleRemoved };
    } catch (error) {
      console.warn("[useOfflineSync] syncNow error:", error);
      return {};
    } finally {
      // Ensure the isSyncing state is explicitly set to false inside a finally {} block
      isSyncingRef.current = false;
      setIsSyncing(false);
      try {
        await refreshCounts();
      } catch {
        // Ignore count refresh error in finally
      }
    }
  }, [companyId, refreshCounts]);

  const handleClearFailedSyncs = useCallback(async () => {
    try {
      const cleared = await clearFailedSyncs();
      await refreshCounts();
      return cleared;
    } catch (err) {
      console.warn("[useOfflineSync] Error clearing failed syncs:", err);
      return 0;
    }
  }, [refreshCounts]);

  // Network online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Automatically trigger syncQueueToServer() and refreshLocalCache() the moment device regains internet
      void syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial counts load
    void refreshCounts();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncNow, refreshCounts]);

  // 5-minute periodic interval while online to keep guard screen fresh
  useEffect(() => {
    if (!isOnline) return undefined;

    const intervalId = setInterval(() => {
      if (navigator.onLine && !isSyncingRef.current) {
        void syncNow();
      }
    }, syncIntervalMs);

    return () => clearInterval(intervalId);
  }, [isOnline, syncIntervalMs, syncNow]);

  // Initial sync on mount if online
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.onLine) {
      void syncNow();
    }
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isOnline,
    isSyncing,
    lastSynced,
    pendingCount,
    failedCount,
    syncNow,
    refreshPendingCount: refreshCounts,
    clearFailedSyncs: handleClearFailedSyncs,
  };
}

