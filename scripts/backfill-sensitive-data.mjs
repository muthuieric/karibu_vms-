import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const PAYLOAD_VERSION = "v1";
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

function readBase64Key(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);

  const key = Buffer.from(value, "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error(`${name} must be a 32-byte base64 key. Generate one with: openssl rand -base64 32`);
  }

  return key;
}

const encryptionKey = readBase64Key("FIELD_ENCRYPTION_KEY");
const hashKey = readBase64Key("FIELD_HASH_KEY");

function encryptValue(value) {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    PAYLOAD_VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

function hmacValue(value) {
  return crypto.createHmac("sha256", hashKey).update(value, "utf8").digest("hex");
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

function optionalText(value) {
  const text = String(value || "").trim();
  return text || null;
}

function addDays(isoValue, days) {
  const date = isoValue ? new Date(isoValue) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  safeDate.setUTCDate(safeDate.getUTCDate() + days);
  return safeDate.toISOString();
}

function addMonths(isoValue, months) {
  const date = isoValue ? new Date(isoValue) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  safeDate.setUTCMonth(safeDate.getUTCMonth() + months);
  return safeDate.toISOString();
}

function encryptedField(value, normalizer) {
  const raw = optionalText(value);
  if (!raw) return { encrypted: null, hash: null, last4: null };

  const normalized = normalizer(raw);

  return {
    encrypted: encryptValue(raw),
    hash: normalized ? hmacValue(normalized) : null,
    last4: getLast4(raw),
  };
}

function mergeEncryptedField(row, prefix, value, normalizer) {
  const next = encryptedField(value, normalizer);
  return {
    [`${prefix}_encrypted`]: next.encrypted ?? row[`${prefix}_encrypted`] ?? null,
    [`${prefix}_hash`]: next.hash ?? row[`${prefix}_hash`] ?? null,
    [`${prefix}_last4`]: next.last4 ?? row[`${prefix}_last4`] ?? null,
  };
}

function encryptedName(value) {
  const raw = optionalText(value);
  return raw ? encryptValue(raw) : null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function fetchVisitorBatch() {
  const { data, error } = await supabase
    .from("visitors")
    .select("id, created_at, phone, phone_encrypted, phone_hash, phone_last4, id_number, id_number_encrypted, id_number_hash, id_number_last4, vehicle_reg, vehicle_reg_encrypted, vehicle_reg_hash, vehicle_reg_last4, retention_days, delete_after")
    .or("phone.not.is.null,id_number.not.is.null,vehicle_reg.not.is.null")
    .limit(BATCH_SIZE);

  if (error) throw error;
  return data || [];
}

async function backfillVisitors() {
  let count = 0;

  while (true) {
    const rows = await fetchVisitorBatch();
    if (rows.length === 0) break;

    for (const row of rows) {
      const { error } = await supabase
        .from("visitors")
        .update({
          ...mergeEncryptedField(row, "phone", row.phone, normalizePhone),
          ...mergeEncryptedField(row, "id_number", row.id_number, normalizeIdentifier),
          ...mergeEncryptedField(row, "vehicle_reg", row.vehicle_reg, normalizeIdentifier),
          retention_days: row.retention_days || 180,
          delete_after: row.delete_after || addDays(row.created_at, 180),
          phone: null,
          id_number: null,
          vehicle_reg: null,
        })
        .eq("id", row.id);

      if (error) throw error;
      count += 1;
    }
  }

  return count;
}

async function fetchRedFlagBatch() {
  const { data, error } = await supabase
    .from("red_flags")
    .select("id, created_at, name, name_encrypted, phone, phone_encrypted, phone_hash, phone_last4, id_number, id_number_encrypted, id_number_hash, id_number_last4, review_at, expires_at, status")
    .or("phone.not.is.null,id_number.not.is.null,name_encrypted.is.null")
    .limit(BATCH_SIZE);

  if (error) throw error;
  return data || [];
}

async function backfillRedFlags() {
  let count = 0;

  while (true) {
    const rows = await fetchRedFlagBatch();
    if (rows.length === 0) break;

    for (const row of rows) {
      const nameEncrypted = row.name_encrypted || encryptedName(row.name);

      const { error } = await supabase
        .from("red_flags")
        .update({
          name_encrypted: nameEncrypted,
          ...mergeEncryptedField(row, "phone", row.phone, normalizePhone),
          ...mergeEncryptedField(row, "id_number", row.id_number, normalizeIdentifier),
          review_at: row.review_at || addMonths(row.created_at, 12),
          expires_at: row.expires_at || addMonths(row.created_at, 24),
          status: row.status || "active",
          phone: null,
          id_number: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (error) throw error;
      count += 1;
    }
  }

  return count;
}

const visitorCount = await backfillVisitors();
const redFlagCount = await backfillRedFlags();

console.log(`Backfilled visitors: ${visitorCount}`);
console.log(`Backfilled red_flags: ${redFlagCount}`);
