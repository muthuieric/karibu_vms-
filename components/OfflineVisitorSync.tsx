"use client";

import { useEffect } from "react";
import { syncPendingOfflineVisitors } from "@/lib/offline-visitor-queue";

export default function OfflineVisitorSync() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const requestSync = async () => {
      if (!navigator.onLine) return;

      try {
        await syncPendingOfflineVisitors();
      } catch (error) {
        console.error("Offline visitor sync failed:", error);
      }

      try {
        const registration = await navigator.serviceWorker?.ready;
        registration?.active?.postMessage({ type: "SYNC_OFFLINE_VISITORS" });
        await registration?.sync?.register?.("sync-offline-visitors");
      } catch {
        // Background Sync is not supported in every browser. The manual sync above still runs.
      }
    };

    requestSync();
    window.addEventListener("online", requestSync);

    return () => window.removeEventListener("online", requestSync);
  }, []);

  return null;
}
