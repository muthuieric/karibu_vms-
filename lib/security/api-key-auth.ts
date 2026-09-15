import { createHash, randomBytes } from "crypto";
import { createSupabaseAdmin } from "@/lib/billing/server";

export type AuthenticatedApiContext = {
  companyId: string;
  companyName: string;
  keyId: string;
  keyName: string;
  groupLabel: string;
  userLabel: string;
  supabaseAdmin: ReturnType<typeof createSupabaseAdmin>;
};

/**
 * Computes the SHA-256 hex digest of a raw API key token.
 */
export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey.trim()).digest("hex");
}

/**
 * Generates a cryptographically strong API key.
 * Format: kvms_live_<48 hex chars>
 * Prefix: kvms_live_<first 8 hex chars>...
 */
export function generateApiKey(prefix = "kvms_live") {
  const token = randomBytes(24).toString("hex");
  const rawKey = `${prefix}_${token}`;
  const keyPrefix = `${prefix}_${token.slice(0, 8)}...`;
  const keyHash = hashApiKey(rawKey);

  return {
    rawKey,
    keyPrefix,
    keyHash,
  };
}

/**
 * Extracts and authenticates an API key from incoming HTTP headers.
 * Looks for 'Authorization: Bearer <key>' or 'x-api-key: <key>'.
 */
export async function authenticateApiKey(request: Request): Promise<AuthenticatedApiContext> {
  let token: string | null = null;

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) {
      token = match[1].trim();
    }
  }

  if (!token) {
    token = request.headers.get("x-api-key")?.trim() || null;
  }

  if (!token) {
    throw Object.assign(
      new Error("Missing API key. Provide Bearer token in Authorization header or x-api-key header."),
      { status: 401 }
    );
  }

  const keyHash = hashApiKey(token);
  const supabaseAdmin = createSupabaseAdmin();

  const { data: keyRecord, error } = await supabaseAdmin
    .from("api_keys")
    .select(`
      id,
      name,
      company_id,
      is_active,
      companies (
        id,
        name,
        is_locked,
        hard_locked,
        group_label,
        user_label
      )
    `)
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();

  if (error || !keyRecord) {
    throw Object.assign(new Error("Invalid or inactive API key."), { status: 401 });
  }

  const company = keyRecord.companies as unknown as {
    id: string;
    name: string;
    is_locked?: boolean | null;
    hard_locked?: boolean | null;
    group_label?: string | null;
    user_label?: string | null;
  } | null;

  if (!company) {
    throw Object.assign(new Error("Associated workspace organization not found."), { status: 404 });
  }

  if (company.is_locked || company.hard_locked) {
    throw Object.assign(
      new Error("This workspace organization is currently locked or suspended. Contact support."),
      { status: 403 }
    );
  }

  // Asynchronously record last_used_at without awaiting to minimize latency
  void (async () => {
    try {
      await supabaseAdmin
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", keyRecord.id);
    } catch (err) {
      console.warn("Failed to update api_key last_used_at:", err);
    }
  })();

  return {
    companyId: company.id,
    companyName: company.name,
    keyId: keyRecord.id,
    keyName: keyRecord.name,
    groupLabel: company.group_label || "Department",
    userLabel: company.user_label || "Host",
    supabaseAdmin,
  };
}

