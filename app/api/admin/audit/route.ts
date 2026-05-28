import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit-log";

export async function POST(request: Request) {
  try {
    const { action, resourceType, resourceId, metadata, companyId } = await request.json();
    const auth = await requireRole(request, ["company_admin", "superadmin"]);
    const safeCompanyId = auth.profile.role === "superadmin" ? companyId || auth.profile.company_id : auth.profile.company_id;

    if (!safeCompanyId) {
      return NextResponse.json({ error: "Company context is required." }, { status: 400 });
    }

    assertCompanyAccess(auth.profile, safeCompanyId);

    await writeAuditLog({
      supabaseAdmin: auth.supabaseAdmin,
      companyId: safeCompanyId,
      actor: auth.profile,
      action: String(action || "admin_audit_event"),
      resourceType: resourceType ? String(resourceType) : null,
      resourceId: resourceId ? String(resourceId) : null,
      metadata: typeof metadata === "object" && metadata ? metadata : {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin audit event failed:", error);
    const safeError = getSafeErrorResponse(error, "Audit event could not be recorded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
