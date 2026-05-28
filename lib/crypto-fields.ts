import "server-only";

import crypto from "node:crypto";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const PAYLOAD_VERSION = "v1";
const IV_BYTES = 12;
const KEY_BYTES = 32;

function readBase64Key(name: "FIELD_ENCRYPTION_KEY" | "FIELD_HASH_KEY") {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  const key = Buffer.from(value, "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error(`${name} must be a 32-byte base64 key. Generate one with: openssl rand -base64 32`);
  }

  return key;
}

function getEncryptionKey() {
  return readBase64Key("FIELD_ENCRYPTION_KEY");
}

function getHashKey() {
  return readBase64Key("FIELD_HASH_KEY");
}

export function encryptValue(value: string): string {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    PAYLOAD_VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

export function decryptValue(payload: string | null): string | null {
  if (!payload) return null;

  const [version, ivBase64, tagBase64, ciphertextBase64] = payload.split(":");
  if (version !== PAYLOAD_VERSION || !ivBase64 || !tagBase64 || !ciphertextBase64) {
    return null;
  }

  try {
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      getEncryptionKey(),
      Buffer.from(ivBase64, "base64")
    );
    decipher.setAuthTag(Buffer.from(tagBase64, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextBase64, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch (error) {
    console.error("Encrypted field could not be decrypted.", error);
    return null;
  }
}

export function hmacValue(value: string): string {
  return crypto.createHmac("sha256", getHashKey()).update(value, "utf8").digest("hex");
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
