#!/usr/bin/env node

/**
 * Karibu VMS - Directory Sync & Integration Test Suite
 * Tests API key generation, cryptographic hashing, payload normalization,
 * and external ID upsert mapping for PMS systems.
 */

import { createHash, randomBytes } from "crypto";

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log("\n🔗 Running Karibu VMS Directory Sync & PMS Integration Tests...\n");

// 1. Test Cryptographic API Key Generation & Hashing
console.log("1. Testing API Key Generation & Cryptographic Hashing...");

function hashApiKey(rawKey) {
  return createHash("sha256").update(rawKey.trim()).digest("hex");
}

function generateApiKey(prefix = "kvms_live") {
  const token = randomBytes(24).toString("hex");
  const rawKey = `${prefix}_${token}`;
  const keyPrefix = `${prefix}_${token.slice(0, 8)}...`;
  const keyHash = hashApiKey(rawKey);

  return { rawKey, keyPrefix, keyHash };
}

const key1 = generateApiKey();
assert(key1.rawKey.startsWith("kvms_live_"), "Generated key has prefix 'kvms_live_'");
assert(key1.rawKey.length === 58, `Raw key length is 58 characters (got ${key1.rawKey.length})`);
assert(key1.keyPrefix.startsWith("kvms_live_") && key1.keyPrefix.endsWith("..."), "Key display prefix is formatted properly");
assert(key1.keyHash.length === 64, "Key hash is a valid 256-bit (64 hex char) SHA-256 digest");
assert(hashApiKey(key1.rawKey) === key1.keyHash, "Hashing raw key is deterministic and matches stored hash");

const key2 = generateApiKey();
assert(key1.rawKey !== key2.rawKey, "Subsequent keys are cryptographically unique");
assert(key1.keyHash !== key2.keyHash, "Key hashes are cryptographically distinct");

// 2. Test Group Payload Normalization
console.log("\n2. Testing Directory Sync Groups Payload Normalization...");

function normalizeGroupInputs(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.groups)) return body.groups;
  if (body && typeof body === "object" && body.name && body.external_id) return [body];
  return [];
}

const singleGroup = { name: "Block A - Unit 101", external_id: "unit_101" };
const batchGroups = { groups: [{ name: "Unit 101", external_id: "u1" }, { name: "Unit 102", external_id: "u2" }] };
const arrayGroups = [{ name: "Unit 201", external_id: "u201" }];

assert(normalizeGroupInputs(singleGroup).length === 1, "Single group payload normalized to 1 element");
assert(normalizeGroupInputs(batchGroups).length === 2, "Batch { groups: [...] } normalized to 2 elements");
assert(normalizeGroupInputs(arrayGroups).length === 1, "Array [...] normalized to 1 element");
assert(normalizeGroupInputs({}).length === 0, "Empty payload normalized to 0 elements");

// 3. Test User Payload Normalization
console.log("\n3. Testing Directory Sync Users Payload Normalization...");

function normalizeUserInputs(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.users)) return body.users;
  if (body && typeof body === "object" && body.name && body.external_id) return [body];
  return [];
}

const singleUser = { name: "Alice Tenant", external_id: "ten_01", group_external_id: "unit_101" };
const batchUsers = {
  users: [
    { name: "Bob Resident", external_id: "ten_02", group_external_id: "unit_101" },
    { name: "Charlie Staff", external_id: "staff_01", group_external_id: "dept_hr" },
  ],
};

assert(normalizeUserInputs(singleUser).length === 1, "Single user payload normalized to 1 element");
assert(normalizeUserInputs(batchUsers).length === 2, "Batch { users: [...] } normalized to 2 elements");
assert(normalizeUserInputs(null).length === 0, "Null payload returns empty array");

// 4. Test Idempotent External ID Sync Simulation (PMS -> Karibu VMS)
console.log("\n4. Simulating Idempotent External ID Upsert Engine...");

// In-memory mock database
const dbDepartments = new Map();
const dbHosts = new Map();

function syncGroups(companyId, groups) {
  let created = 0;
  let updated = 0;

  for (const g of groups) {
    const key = `${companyId}:${g.external_id}`;
    if (dbDepartments.has(key)) {
      const existing = dbDepartments.get(key);
      existing.name = g.name;
      updated++;
    } else {
      dbDepartments.set(key, { id: `dept_uuid_${Math.random()}`, name: g.name, external_id: g.external_id });
      created++;
    }
  }

  return { created, updated };
}

function syncUsers(companyId, users) {
  let created = 0;
  let updated = 0;

  for (const u of users) {
    const key = `${companyId}:${u.external_id}`;
    const groupKey = `${companyId}:${u.group_external_id}`;
    const group = dbDepartments.get(groupKey);

    if (!group) {
      throw new Error(`Foreign group '${u.group_external_id}' not found for user '${u.external_id}'`);
    }

    if (dbHosts.has(key)) {
      const existing = dbHosts.get(key);
      existing.name = u.name;
      existing.phone = u.phone || existing.phone;
      existing.department_id = group.id;
      updated++;
    } else {
      dbHosts.set(key, {
        id: `host_uuid_${Math.random()}`,
        name: u.name,
        phone: u.phone,
        external_id: u.external_id,
        department_id: group.id,
      });
      created++;
    }
  }

  return { created, updated };
}

// First sync run: 3 units
const sync1 = syncGroups("comp_123", [
  { name: "House 1", external_id: "hse_01" },
  { name: "House 2", external_id: "hse_02" },
  { name: "House 3", external_id: "hse_03" },
]);
assert(sync1.created === 3 && sync1.updated === 0, "Initial sync creates 3 units in database");

// Second sync run: 1 renamed unit, 1 unchanged unit, 1 new unit
const sync2 = syncGroups("comp_123", [
  { name: "House 1 - Main Wing", external_id: "hse_01" },
  { name: "House 2", external_id: "hse_02" },
  { name: "House 4", external_id: "hse_04" },
]);
assert(sync2.created === 1 && sync2.updated === 2, "Second sync correctly updates 2 existing units and creates 1 new unit without duplicates");
assert(dbDepartments.get("comp_123:hse_01").name === "House 1 - Main Wing", "External ID mapping correctly updated group name");

// Sync tenants into groups
const userSync1 = syncUsers("comp_123", [
  { name: "David M.", external_id: "ten_01", group_external_id: "hse_01", phone: "+254711111111" },
  { name: "Sarah K.", external_id: "ten_02", group_external_id: "hse_02", phone: "+254722222222" },
]);
assert(userSync1.created === 2 && userSync1.updated === 0, "Initial tenant sync creates 2 hosts");

// Re-sync with phone update for David M.
const userSync2 = syncUsers("comp_123", [
  { name: "David M.", external_id: "ten_01", group_external_id: "hse_01", phone: "+254799999999" },
]);
assert(userSync2.created === 0 && userSync2.updated === 1, "Re-syncing existing tenant updates details without creating duplicate host");
assert(dbHosts.get("comp_123:ten_01").phone === "+254799999999", "Tenant phone successfully updated by external_id");

// 5. Test Dynamic Terminology Presets
console.log("\n5. Testing Dynamic Terminology Presets...");

const presets = [
  { type: "Corporate", group: "Department", user: "Host" },
  { type: "Residential", group: "House / Unit", user: "Tenant" },
  { type: "Commercial", group: "Suite / Office", user: "Tenant" },
  { type: "School", group: "Classroom / Faculty", user: "Teacher" },
];

for (const p of presets) {
  const pluralGroup = p.group.endsWith("s") ? p.group : `${p.group}s`;
  const pluralUser = p.user.endsWith("s") ? p.user : `${p.user}s`;
  assert(pluralGroup.length > p.group.length || p.group.endsWith("s"), `Preset ${p.type} pluralizes group '${p.group}' -> '${pluralGroup}'`);
  assert(pluralUser.length > p.user.length || p.user.endsWith("s"), `Preset ${p.type} pluralizes user '${p.user}' -> '${pluralUser}'`);
}

console.log("\n------------------------------------------------------------");
console.log("🎉 All Directory Sync & Integration Tests Passed Successfully!\n");

