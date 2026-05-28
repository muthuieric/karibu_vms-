import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const PAYLOAD_VERSION_V1 = "v1";
const PAYLOAD_VERSION_V2 = "v2";
const LEGACY_KEY_ID = "legacy";
const IV_BYTES = 12;
const KEY_BYTES = 32;
const BATCH_SIZE = 100;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

function readBase64Key(name, value) {
  const key = Buffer.from(String(value || "").trim(), "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error(`${name} must contain 32-byte base64 keys. Generate one with: openssl rand -base64 32`);
  }
  return key;
}

function readKeyring(name, legacyName) {
  const keys = new Map();
  const raw = process.env[name]?.trim();

  if (raw) {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`${name} must be a JSON object of key IDs to base64 keys.`);
    }

    for (const [keyId, value] of Object.entries(parsed)) {
      if (!keyId || keyId.includes(":")) {
        throw new Error(`${name} contains an invalid key ID: ${keyId}`);
      }
      keys.set(keyId, readBase64Key(`${name}.${keyId}`, value));
    }
  }

  const legacyValue = process.env[legacyName]?.trim();
  if (legacyValue && !keys.has(LEGACY_KEY_ID)) {
    keys.set(LEGACY_KEY_ID, readBase64Key(legacyName, legacyValue));
  }

  if (keys.size === 0) {
    throw new Error(`${name} or ${legacyName} is not configured.`);
  }

  return keys;
}

function getActiveKeyId(name, keys) {
  const activeKeyId = process.env[name]?.trim() || (keys.has(LEGACY_KEY_ID) ? LEGACY_KEY_ID : "");
  if (!activeKeyId) throw new Error(`${name} is not configured.`);
  if (!keys.has(activeKeyId)) throw new Error(`${name}=${activeKeyId} does not exist in configured field keys.`);
  return activeKeyId;
}

const encryptionKeys = readKeyring("FIELD_ENCRYPTION_KEYS", "FIELD_ENCRYPTION_KEY");
const hashKeys = readKeyring("FIELD_HASH_KEYS", "FIELD_HASH_KEY");
const activeEncryptionKeyId = getActiveKeyId("FIELD_ACTIVE_ENCRYPTION_KEY_ID", encryptionKeys);
const activeHashKeyId = getActiveKeyId("FIELD_ACTIVE_HASH_KEY_ID", hashKeys);

function encryptValue(value) {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, encryptionKeys.get(activeEncryptionKeyId), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    PAYLOAD_VERSION_V2,
    activeEncryptionKeyId,
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

function decryptValue(payload) {
  if (!payload) return { value: null, keyId: null };

  const parts = String(payload).split(":");
  const [version] = parts;
  if (version === PAYLOAD_VERSION_V1) {
    const [, ivBase64, tagBase64, ciphertextBase64] = parts;
    const key = encryptionKeys.get(LEGACY_KEY_ID);
    if (parts.length !== 4 || !key) throw new Error("Invalid v1 payload or missing legacy key.");
    return { value: decryptWithKey(key, ivBase64, tagBase64, ciphertextBase64), keyId: LEGACY_KEY_ID };
  }

  if (version === PAYLOAD_VERSION_V2) {
    const [, keyId, ivBase64, tagBase64, ciphertextBase64] = parts;
    const key = encryptionKeys.get(keyId);
    if (parts.length !== 5 || !key) throw new Error("Invalid v2 payload or missing key.");
    return { value: decryptWithKey(key, ivBase64, tagBase64, ciphertextBase64), keyId };
  }

  throw new Error("Unsupported encrypted payload version.");
}

function decryptWithKey(key, ivBase64, tagBase64, ciphertextBase64) {
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, Buffer.from(ivBase64, "base64"));
  decipher.setAuthTag(Buffer.from(tagBase64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextBase64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function hmacValue(value) {
  return crypto.createHmac("sha256", hashKeys.get(activeHashKeyId)).update(value, "utf8").digest("hex");
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

function normalizeIdentifier(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function getLast4(value) {
  const normalized = String(value || "").trim();
  return normalized.slice(Math.max(0, normalized.length - 4));
}

function rotateEncryptedField(row, column) {
  const payload = row[column];
  if (!payload) return { update: {}, rotated: false };

  const { value, keyId } = decryptValue(payload);
  if (value === null) return { update: {}, rotated: false };

  return {
    update: keyId === activeEncryptionKeyId ? {} : { [column]: encryptValue(value) },
    rotated: keyId !== activeEncryptionKeyId,
    value,
  };
}

function rotateIdentifierField(row, prefix, normalizer) {
  const encryptedColumn = `${prefix}_encrypted`;
  const hashColumn = `${prefix}_hash`;
  const last4Column = `${prefix}_last4`;
  const rotated = rotateEncryptedField(row, encryptedColumn);
  const update = { ...rotated.update };

  if (rotated.value) {
    const normalized = normalizer(rotated.value);
    update[hashColumn] = normalized ? hmacValue(normalized) : null;
    update[last4Column] = normalized ? getLast4(normalized) : null;
  }

  return { update, rotated: rotated.rotated };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function rotateTable({ table, select, buildUpdate }) {
  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order("id", { ascending: true })
      .range(from, from + BATCH_SIZE - 1);

    if (error) throw error;
    const rows = data || [];
    if (rows.length === 0) break;

    for (const row of rows) {
      scanned += 1;

      let update;
      try {
        update = buildUpdate(row);
      } catch (error) {
        skipped += 1;
        console.error(`${table} row ${row.id} skipped: encrypted field could not be decrypted.`, error.message);
        continue;
      }

      if (Object.keys(update).length === 0) continue;

      const { error: updateError } = await supabase.from(table).update(update).eq("id", row.id);
      if (updateError) throw updateError;
      updated += 1;
    }

    from += rows.length;
  }

  return { scanned, updated, skipped };
}

function buildVisitorUpdate(row) {
  const phone = rotateIdentifierField(row, "phone", normalizePhone);
  const idNumber = rotateIdentifierField(row, "id_number", normalizeIdentifier);
  const vehicleReg = rotateIdentifierField(row, "vehicle_reg", normalizeIdentifier);
  const update = {
    ...phone.update,
    ...idNumber.update,
    ...vehicleReg.update,
  };

  if (Object.keys(update).length > 0) {
    update.hash_key_id = activeHashKeyId;
  }

  return update;
}

function buildRedFlagUpdate(row) {
  const name = rotateEncryptedField(row, "name_encrypted");
  const phone = rotateIdentifierField(row, "phone", normalizePhone);
  const idNumber = rotateIdentifierField(row, "id_number", normalizeIdentifier);
  const vehicleReg = rotateIdentifierField(row, "vehicle_reg", normalizeIdentifier);
  const update = {
    ...name.update,
    ...phone.update,
    ...idNumber.update,
    ...vehicleReg.update,
  };

  if (Object.keys(update).length > 0) {
    update.hash_key_id = activeHashKeyId;
    update.updated_at = new Date().toISOString();
  }

  return update;
}

console.log(`Rotating encrypted fields to ${activeEncryptionKeyId} and hashes to ${activeHashKeyId}.`);
console.log("Keep old keys configured until this script reports zero skipped rows and old data has been verified.");

const visitorResult = await rotateTable({
  table: "visitors",
  select: "id, phone_encrypted, phone_hash, phone_last4, id_number_encrypted, id_number_hash, id_number_last4, vehicle_reg_encrypted, vehicle_reg_hash, vehicle_reg_last4, hash_key_id",
  buildUpdate: buildVisitorUpdate,
});

const redFlagResult = await rotateTable({
  table: "red_flags",
  select: "id, name_encrypted, phone_encrypted, phone_hash, phone_last4, id_number_encrypted, id_number_hash, id_number_last4, vehicle_reg_encrypted, vehicle_reg_hash, vehicle_reg_last4, hash_key_id",
  buildUpdate: buildRedFlagUpdate,
});

console.log(`Visitors scanned: ${visitorResult.scanned}, updated: ${visitorResult.updated}, skipped: ${visitorResult.skipped}`);
console.log(`Red flags scanned: ${redFlagResult.scanned}, updated: ${redFlagResult.updated}, skipped: ${redFlagResult.skipped}`);
