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

    existingQuery = companyId
      ? existingQuery.eq("company_id", companyId)
      : existingQuery.is("company_id", null);

    existingQuery = actor?.id
      ? existingQuery.eq("actor_profile_id", actor.id)
      : existingQuery.is("actor_profile_id", null);

    existingQuery = resourceType
      ? existingQuery.eq("resource_type", resourceType)
      : existingQuery.is("resource_type", null);

    existingQuery = resourceId
      ? existingQuery.eq("resource_id", resourceId)
      : existingQuery.is("resource_id", null);

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
