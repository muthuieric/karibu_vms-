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
};

export async function writeAuditLog({
  supabaseAdmin,
  companyId = null,
  actor = null,
  action,
  resourceType = null,
  resourceId = null,
  metadata = {},
}: AuditLogInput) {
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
