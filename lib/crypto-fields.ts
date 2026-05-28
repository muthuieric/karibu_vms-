import "server-only";

import crypto from "node:crypto";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const PAYLOAD_VERSION_V1 = "v1";
const PAYLOAD_VERSION_V2 = "v2";
const LEGACY_KEY_ID = "legacy";
const IV_BYTES = 12;
const KEY_BYTES = 32;

type KeyringEnvName = "FIELD_ENCRYPTION_KEYS" | "FIELD_HASH_KEYS";
type LegacyKeyEnvName = "FIELD_ENCRYPTION_KEY" | "FIELD_HASH_KEY";

function readBase64Key(name: string, value: string) {
  const key = Buffer.from(value.trim(), "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error(`${name} must contain 32-byte base64 keys. Generate one with: openssl rand -base64 32`);
  }

  return key;
}

function readLegacyBase64Key(name: LegacyKeyEnvName) {
  const value = process.env[name]?.trim();
  if (!value) {
    return null;
  }

  return readBase64Key(name, value);
}

function readKeyring(name: KeyringEnvName, legacyName: LegacyKeyEnvName) {
  const keys = new Map<string, Buffer>();
  const raw = process.env[name]?.trim();

  if (raw) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`${name} must be a JSON object of key IDs to base64 keys.`);
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`${name} must be a JSON object of key IDs to base64 keys.`);
    }

    for (const [keyId, value] of Object.entries(parsed)) {
      if (!keyId || keyId.includes(":")) {
        throw new Error(`${name} contains an invalid key ID: ${keyId}`);
      }
      if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${name}.${keyId} must be a base64 key string.`);
      }
      keys.set(keyId, readBase64Key(`${name}.${keyId}`, value));
    }
  }

  const legacyKey = readLegacyBase64Key(legacyName);
  if (legacyKey && !keys.has(LEGACY_KEY_ID)) {
    keys.set(LEGACY_KEY_ID, legacyKey);
  }

  if (keys.size === 0) {
    throw new Error(`${name} or ${legacyName} is not configured.`);
  }

  return keys;
}

function getActiveKeyId(activeName: "FIELD_ACTIVE_ENCRYPTION_KEY_ID" | "FIELD_ACTIVE_HASH_KEY_ID", keys: Map<string, Buffer>) {
  const activeKeyId = process.env[activeName]?.trim() || (keys.has(LEGACY_KEY_ID) ? LEGACY_KEY_ID : "");
  if (!activeKeyId) {
    throw new Error(`${activeName} is not configured.`);
  }
  if (!keys.has(activeKeyId)) {
    throw new Error(`${activeName}=${activeKeyId} does not exist in configured field keys.`);
  }

  return activeKeyId;
}

function getEncryptionKeys() {
  return readKeyring("FIELD_ENCRYPTION_KEYS", "FIELD_ENCRYPTION_KEY");
}

function getHashKeys() {
  return readKeyring("FIELD_HASH_KEYS", "FIELD_HASH_KEY");
}

function decryptWithKey(key: Buffer, ivBase64: string, tagBase64: string, ciphertextBase64: string) {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    Buffer.from(ivBase64, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagBase64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextBase64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function getActiveHashKeyId(): string {
  return getActiveKeyId("FIELD_ACTIVE_HASH_KEY_ID", getHashKeys());
}

export function encryptValue(value: string): string {
  const keys = getEncryptionKeys();
  const activeKeyId = getActiveKeyId("FIELD_ACTIVE_ENCRYPTION_KEY_ID", keys);
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, keys.get(activeKeyId)!, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    PAYLOAD_VERSION_V2,
    activeKeyId,
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

export function decryptValue(payload: string | null): string | null {
  if (!payload) return null;

  const parts = payload.split(":");
  const [version] = parts;
  if (version !== PAYLOAD_VERSION_V1 && version !== PAYLOAD_VERSION_V2) {
    return null;
  }

  try {
    const keys = getEncryptionKeys();
    if (version === PAYLOAD_VERSION_V1) {
      const [, ivBase64, tagBase64, ciphertextBase64] = parts;
      const legacyKey = keys.get(LEGACY_KEY_ID);
      if (parts.length !== 4 || !ivBase64 || !tagBase64 || !ciphertextBase64 || !legacyKey) {
        return null;
      }
      return decryptWithKey(legacyKey, ivBase64, tagBase64, ciphertextBase64);
    }

    const [, keyId, ivBase64, tagBase64, ciphertextBase64] = parts;
    const key = keyId ? keys.get(keyId) : null;
    if (parts.length !== 5 || !key || !ivBase64 || !tagBase64 || !ciphertextBase64) {
      return null;
    }

    return decryptWithKey(key, ivBase64, tagBase64, ciphertextBase64);
  } catch (error) {
    console.error("Encrypted field could not be decrypted.", error);
    return null;
  }
}

export function activeHmacValue(value: string): string {
  const keys = getHashKeys();
  const activeKeyId = getActiveKeyId("FIELD_ACTIVE_HASH_KEY_ID", keys);
  return crypto.createHmac("sha256", keys.get(activeKeyId)!).update(value, "utf8").digest("hex");
}

export function hmacValuesForAllKeys(value: string): string[] {
  const hashes = Array.from(getHashKeys().values()).map((key) =>
    crypto.createHmac("sha256", key).update(value, "utf8").digest("hex")
  );
  return Array.from(new Set(hashes));
}

export function hmacValue(value: string): string {
  return activeHmacValue(value);
}

export function normalizePhone(value: string): string {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

export function normalizeIdentifier(value: string): string {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function getLast4(value: string): string {
  const normalized = String(value || "").trim();
  return normalized.slice(Math.max(0, normalized.length - 4));
}
