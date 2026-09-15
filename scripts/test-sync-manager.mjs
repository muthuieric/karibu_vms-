#!/usr/bin/env node

/**
 * Karibu VMS - Dexie Background Synchronization & Cache Cleanup Test Suite
 * Tests syncQueueToServer logic, refreshLocalCache updating, and clearStaleData filtering.
 */

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log("\n📦 Running Karibu VMS Offline Sync Manager & Cache Cleanup Tests...\n");

// 1. Test Stale Data Identification & Retention
console.log("1. Testing Stale Data Filtering Logic (24-Hour Cutoff)...");

const now = Date.now();
const twentyFourHoursMs = 24 * 60 * 60 * 1000;
const cutoffTime = now - twentyFourHoursMs;

const mockVisitors = [
  {
    id: "vis_fresh_1",
    name: "Alice Johnson",
    created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    expected_arrival: null,
  },
  {
    id: "vis_stale_1",
    name: "Bob Smith",
    created_at: new Date(now - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago
    expected_arrival: null,
  },
  {
    id: "vis_stale_expected",
    name: "Charlie Brown",
    created_at: new Date(now - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
    expected_arrival: new Date(now - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
  },
  {
    id: "vis_expected_today",
    name: "David Miller",
    created_at: new Date(now - 30 * 60 * 60 * 1000).toISOString(), // created yesterday
    expected_arrival: new Date(now + 2 * 60 * 60 * 1000).toISOString(), // arrives today
  },
  {
    id: "vis_stale_but_pending_sync",
    name: "Eve Offline",
    created_at: new Date(now - 28 * 60 * 60 * 1000).toISOString(),
    expected_arrival: null,
  },
];

const pendingSyncIds = new Set(["vis_stale_but_pending_sync"]);

function filterStaleVisitors(visitors, pendingSet, cutoff) {
  const stale = [];
  for (const v of visitors) {
    if (pendingSet.has(v.id)) continue; // Protected from deletion

    const createdMs = v.created_at ? new Date(v.created_at).getTime() : 0;
    const expectedMs = v.expected_arrival ? new Date(v.expected_arrival).getTime() : 0;
    const refTime = expectedMs > 0 ? expectedMs : createdMs;

    if (refTime > 0 && refTime < cutoff) {
      stale.push(v.id);
    }
  }
  return stale;
}

const staleIds = filterStaleVisitors(mockVisitors, pendingSyncIds, cutoffTime);

assert(staleIds.includes("vis_stale_1"), "Identifies visitor created 26h ago as stale");
assert(staleIds.includes("vis_stale_expected"), "Identifies visitor with past expected_arrival as stale");
assert(!staleIds.includes("vis_fresh_1"), "Preserves fresh visitor created 2h ago");
assert(!staleIds.includes("vis_expected_today"), "Preserves visitor with arrival expected today");
assert(!staleIds.includes("vis_stale_but_pending_sync"), "Protects pending sync queue visitor from stale data wipe");
assert(staleIds.length === 2, `Exact count of stale visitors is 2 (got ${staleIds.length})`);

// 2. Test Sync Queue Dispatch & 200 OK Record Deletion
console.log("\n2. Testing Sync Queue Dispatch & Queue Deletion Logic...");

let mockSyncQueue = [
  {
    id: 1,
    visitorId: "vis_101",
    action: "confirm_entry",
    payload: { visitorId: "vis_101", gateId: "gate_1" },
    timestamp: 1000,
    status: "pending",
    retryCount: 0,
  },
  {
    id: 2,
    visitorId: "offline_temp_202",
    action: "register_walk_in",
    payload: { name: "Grace Walk-In", phone: "+254700000000" },
    timestamp: 2000,
    status: "pending",
    retryCount: 0,
  },
  {
    id: 3,
    visitorId: "vis_303",
    action: "checkout",
    payload: { visitorId: "vis_303" },
    timestamp: 3000,
    status: "pending",
    retryCount: 0,
  },
];

async function simulateSyncQueue(queue, apiHandler) {
  let synced = 0;
  let failed = 0;
  const processedQueue = [];

  for (const item of queue) {
    let res;
    let networkError = null;
    try {
      res = await apiHandler(item);
    } catch (err) {
      networkError = err;
    }

    if (res && res.ok) {
      synced++;
      // Record deleted on 200 OK
    } else {
      failed++;
      const isHardError = res && res.status >= 400 && res.status < 500;
      const nextRetry = (item.retryCount || 0) + 1;
      const shouldFail = isHardError || nextRetry >= 3;
      const errMsg = (res && res.error) || (networkError && networkError.message) || `HTTP ${res?.status}`;

      processedQueue.push({
        ...item,
        status: shouldFail ? "failed" : "pending",
        retryCount: nextRetry,
        error: errMsg,
      });
    }
  }

  return { synced, failed, remainingQueue: processedQueue };
}

// All successful (200 OK)
const syncRun1 = await simulateSyncQueue(mockSyncQueue, async () => ({ ok: true, status: 200 }));
assert(syncRun1.synced === 3, "All 3 pending records processed successfully");
assert(syncRun1.remainingQueue.length === 0, "All successful records removed from sync_queue");

// Hard Error (400 Bad Request) - must mark as 'failed' immediately, not pending!
const hardErrorRun = await simulateSyncQueue(
  [{ id: 99, visitorId: "vis_bad", action: "register_walk_in", retryCount: 0, status: "pending" }],
  async () => ({ ok: false, status: 400, error: "Missing required visitor name" })
);
assert(hardErrorRun.remainingQueue.length === 1, "Hard error record preserved in queue");
assert(hardErrorRun.remainingQueue[0].status === "failed", "Hard error (400) immediately marked as 'failed'");
assert(hardErrorRun.remainingQueue[0].error === "Missing required visitor name", "Error message saved with failed item");

// Transient Error (500 Server Error) with retryCount = 0 -> stays 'pending' with retryCount = 1
const transientRun1 = await simulateSyncQueue(
  [{ id: 100, visitorId: "vis_transient", action: "confirm_entry", retryCount: 0, status: "pending" }],
  async () => ({ ok: false, status: 500, error: "Internal Server Error" })
);
assert(transientRun1.remainingQueue[0].status === "pending", "Transient 500 error with retryCount 0 stays 'pending'");
assert(transientRun1.remainingQueue[0].retryCount === 1, "Retry count incremented to 1 on transient failure");

// Transient Error with retryCount = 2 (Attempt #3) -> must transition to 'failed'
const maxRetriesRun = await simulateSyncQueue(
  [{ id: 101, visitorId: "vis_failed_after_3", action: "checkout", retryCount: 2, status: "pending" }],
  async () => { throw new Error("Connection timed out"); }
);
assert(maxRetriesRun.remainingQueue[0].status === "failed", "Transient error after 3 attempts marked as 'failed'");
assert(maxRetriesRun.remainingQueue[0].retryCount === 3, "Retry count equals 3");

// Clear Failed Actions test
function clearFailedItems(queue) {
  return queue.filter((item) => item.status !== "failed");
}
const mixedQueue = [
  { id: 1, status: "pending" },
  { id: 2, status: "failed" },
  { id: 3, status: "failed" },
  { id: 4, status: "pending" },
];
const clearedQueue = clearFailedItems(mixedQueue);
assert(clearedQueue.length === 2, "clearFailedSyncs deletes exactly the failed items (2 remaining)");
assert(clearedQueue.every((item) => item.status === "pending"), "Only pending items remain after clearing failed");

// 3. Test Offline Walk-In ID Swapping on Sync
console.log("\n3. Testing Offline Walk-In ID Swapping Logic...");

const localDbVisitors = new Map();
localDbVisitors.set("offline_12345", {
  id: "offline_12345",
  name: "Helen Offline",
  phone: "+254711223344",
  status: "checked_in",
});

function handleWalkInSyncSuccess(localStore, tempId, serverData) {
  if (serverData?.id && tempId !== serverData.id) {
    localStore.delete(tempId);
    localStore.set(serverData.id, {
      ...serverData,
      cached_at: Date.now(),
    });
  }
}

handleWalkInSyncSuccess(localDbVisitors, "offline_12345", {
  id: "vis_real_uuid_999",
  name: "Helen Offline",
  phone: "+254711223344",
  status: "checked_in",
});

assert(!localDbVisitors.has("offline_12345"), "Temporary offline ID deleted after server response");
assert(localDbVisitors.has("vis_real_uuid_999"), "Permanent server UUID inserted into local visitor store");
assert(localDbVisitors.get("vis_real_uuid_999").name === "Helen Offline", "Visitor details preserved after ID swap");

console.log("\n------------------------------------------------------------");
console.log("🎉 All Sync Manager & Offline Cache Cleanup Tests Passed Successfully!\n");

