import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthenticatedProfile } from "@/lib/api-auth";

type AuditLogInput = {
  supabaseAdmin: SupabaseClient;
  companyId?: string | null;
  actor?: Pick<AuthenticatedProfile, "id" | "role"> | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  dedupeWindowSeconds?: number;
};

function applyNullableFilter(
  query: ReturnType<SupabaseClient["from"]> extends { select: (...args: never[]) => infer R } ? R : never,
  column: string,
  value: string | null | undefined
) {
  return value ? query.eq(column, value) : query.is(column, null);
}

export async function writeAuditLog({
  supabaseAdmin,
  companyId = null,
  actor = null,
  action,
  resourceType = null,
  resourceId = null,
  metadata = {},
  dedupeWindowSeconds = 0,
}: AuditLogInput) {
  if (dedupeWindowSeconds > 0) {
    const since = new Date(Date.now() - dedupeWindowSeconds * 1000).toISOString();

    let existingQuery = supabaseAdmin
      .from("audit_logs")
      .select("id")
      .eq("action", action)
      .gte("created_at", since)
      .limit(1);

    existingQuery = applyNullableFilter(existingQuery, "company_id", companyId);
    existingQuery = applyNullableFilter(existingQuery, "actor_profile_id", actor?.id ?? null);
    existingQuery = applyNullableFilter(existingQuery, "resource_type", resourceType);
    existingQuery = applyNullableFilter(existingQuery, "resource_id", resourceId);

    const { data: existing, error: dedupeError } = await existingQuery;

    if (!dedupeError && existing && existing.length > 0) {
      return;
    }

    if (dedupeError) {
      console.error("Audit log dedupe check failed:", { action, resourceType, resourceId, error: dedupeError });
    }
  }

  const payload = {
    company_id: companyId,
    actor_profile_id: actor?.id ?? null,
    actor_role: actor?.role ?? null,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
  };

  const { error } = await supabaseAdmin.from("audit_logs").insert(payload);

  if (error && /actor_role/i.test(error.message || "")) {
    const fallbackPayload = { ...payload };
    delete (fallbackPayload as Partial<typeof payload>).actor_role;
    const retry = await supabaseAdmin.from("audit_logs").insert(fallbackPayload);
    if (!retry.error) return;

    console.error("Audit log write failed:", { action, resourceType, resourceId, error: retry.error });
    return;
  }

  if (error) {
    console.error("Audit log write failed:", { action, resourceType, resourceId, error });
  }
}
