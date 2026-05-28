import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { writeAuditLog } from "@/lib/audit-log";

type CleanupResult = {
  anonymizedVisitors: number;
  clearedPhotos: number;
  expiredRedFlags: number;
};

const VISITOR_CLEANUP_SELECT =
  "id, company_id, retention_hold_until, phone_encrypted, id_number_encrypted, vehicle_reg_encrypted, photo_url";

export async function runRetentionCleanup(supabaseAdmin: SupabaseClient): Promise<CleanupResult> {
  const now = new Date();
  const nowIso = now.toISOString();
  const photoCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const result: CleanupResult = {
    anonymizedVisitors: 0,
    clearedPhotos: 0,
    expiredRedFlags: 0,
  };

  const { data: visitors, error: visitorError } = await supabaseAdmin
    .from("visitors")
    .select(VISITOR_CLEANUP_SELECT)
    .lte("delete_after", nowIso)
    .is("personal_data_anonymized_at", null)
    .or(`retention_hold_until.is.null,retention_hold_until.lte.${nowIso}`)
    .limit(500);

  if (visitorError) throw visitorError;

  for (const visitor of visitors || []) {
    const { error } = await supabaseAdmin
      .from("visitors")
      .update({
        phone: "",
        id_number: null,
        vehicle_reg: null,
        phone_encrypted: null,
        phone_hash: null,
        phone_last4: null,
        id_number_encrypted: null,
        id_number_hash: null,
        id_number_last4: null,
        vehicle_reg_encrypted: null,
        vehicle_reg_hash: null,
        vehicle_reg_last4: null,
        photo_url: null,
        custom_data: {},
        personal_data_anonymized_at: nowIso,
      })
      .eq("id", visitor.id);

    if (error) throw error;
    result.anonymizedVisitors += 1;
    if (visitor.photo_url) result.clearedPhotos += 1;

    await writeAuditLog({
      supabaseAdmin,
      companyId: visitor.company_id,
      action: "admin_anonymised_data",
      resourceType: "visitor",
      resourceId: visitor.id,
      metadata: { reason: "retention_delete_after", deleteAfterReachedAt: nowIso },
    });
  }

  const { data: photoVisitors, error: photoError } = await supabaseAdmin
    .from("visitors")
    .select("id, company_id")
    .not("photo_url", "is", null)
    .lt("created_at", photoCutoff)
    .limit(500);

  if (photoError) throw photoError;

  for (const visitor of photoVisitors || []) {
    const { error } = await supabaseAdmin.from("visitors").update({ photo_url: null }).eq("id", visitor.id);
    if (error) throw error;
    result.clearedPhotos += 1;

    await writeAuditLog({
      supabaseAdmin,
      companyId: visitor.company_id,
      action: "admin_anonymised_data",
      resourceType: "visitor",
      resourceId: visitor.id,
      metadata: { reason: "photo_url_retention_7_days" },
    });
  }

  const { data: redFlags, error: redFlagError } = await supabaseAdmin
    .from("red_flags")
    .select("id, company_id")
    .eq("status", "active")
    .lte("expires_at", nowIso)
    .limit(500);

  if (redFlagError) throw redFlagError;

  for (const redFlag of redFlags || []) {
    const { error } = await supabaseAdmin
      .from("red_flags")
      .update({ status: "expired", updated_at: nowIso })
      .eq("id", redFlag.id);

    if (error) throw error;
    result.expiredRedFlags += 1;

    await writeAuditLog({
      supabaseAdmin,
      companyId: redFlag.company_id,
      action: "admin_expired_deleted_anonymised_data",
      resourceType: "red_flag",
      resourceId: redFlag.id,
      metadata: { reason: "red_flag_expired", expiredAt: nowIso },
    });
  }

  return result;
}
