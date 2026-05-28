import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { decryptValue } from "@/lib/crypto-fields";
import { writeAuditLog } from "@/lib/audit-log";

const ADMIN_VISITOR_SELECT = [
  "id",
  "company_id",
  "name",
  "phone",
  "phone_encrypted",
  "document_type",
  "id_number",
  "id_number_encrypted",
  "vehicle_reg",
  "vehicle_reg_encrypted",
  "status",
  "created_at",
  "checked_out_at",
  "checked_in_at",
  "pass_expired_at",
  "host_id",
  "host_name",
  "host_confirmed",
  "host_confirmed_at",
  "purpose",
  "photo_url",
  "custom_data",
  "gate_id",
  "verification_method",
].join(",");

function decryptOrLegacy(encrypted?: string | null, legacy?: string | null) {
  return decryptValue(encrypted || null) || legacy || "";
}

function toAdminVisitor(visitor: Record<string, unknown>) {
  return {
    id: visitor.id,
    company_id: visitor.company_id,
    name: visitor.name || "Visitor",
    phone: decryptOrLegacy(visitor.phone_encrypted as string | null, visitor.phone as string | null),
    document_type: visitor.document_type,
    id_number: decryptOrLegacy(visitor.id_number_encrypted as string | null, visitor.id_number as string | null),
    status: visitor.status,
    created_at: visitor.created_at,
    checked_out_at: visitor.checked_out_at,
    checked_in_at: visitor.checked_in_at,
    pass_expired_at: visitor.pass_expired_at,
    host_id: visitor.host_id,
    host_name: visitor.host_name,
    host_confirmed: visitor.host_confirmed,
    host_confirmed_at: visitor.host_confirmed_at,
    purpose: visitor.purpose,
    vehicle_reg: decryptOrLegacy(visitor.vehicle_reg_encrypted as string | null, visitor.vehicle_reg as string | null),
    photo_url: visitor.photo_url,
    custom_data: visitor.custom_data || {},
    gate_id: visitor.gate_id,
    verification_method: visitor.verification_method,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedCompanyId = searchParams.get("company_id");
    const visitorId = searchParams.get("id");
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);

    const companyId = profile.role === "superadmin" ? requestedCompanyId || profile.company_id : profile.company_id;
    if (!companyId) {
      return NextResponse.json({ error: "Company context is required." }, { status: 400 });
    }
    assertCompanyAccess(profile, companyId);

    let query = supabaseAdmin
      .from("visitors")
      .select(ADMIN_VISITOR_SELECT)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(visitorId ? 1 : 2000);

    if (visitorId) query = query.eq("id", visitorId);

    const { data, error } = await query;
    if (error) throw error;

    await writeAuditLog({
      supabaseAdmin,
      companyId,
      actor: profile,
      action: "admin_viewed_sensitive_visitor_details",
      resourceType: visitorId ? "visitor" : "visitor_collection",
      resourceId: visitorId || null,
      metadata: { recordCount: data?.length || 0 },
    });

    return NextResponse.json({ data: ((data || []) as unknown as Record<string, unknown>[]).map((visitor) => toAdminVisitor(visitor)) });
  } catch (error) {
    console.error("Admin visitors fetch failed:", error);
    const safeError = getSafeErrorResponse(error, "Visitor records could not be loaded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
