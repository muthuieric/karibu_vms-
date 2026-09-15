import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { requireText, requireUuid } from "@/lib/validation";

/**
 * GET /api/company-admin/terminology
 * Fetches the custom terminology labels for this company.
 */
export async function GET(request: Request) {
  try {
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    const { searchParams } = new URL(request.url);
    const companyIdParam = searchParams.get("company_id") || profile.company_id;
    const companyId = requireUuid(companyIdParam, "company_id");

    assertCompanyAccess(profile, companyId);

    const { data, error } = await supabaseAdmin
      .from("companies")
      .select("id, group_label, user_label")
      .eq("id", companyId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      group_label: data?.group_label || "Department",
      user_label: data?.user_label || "Host",
    });
  } catch (error) {
    console.error("Fetch terminology error:", error);
    const safeError = getSafeErrorResponse(error, "Failed to load workspace terminology.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

/**
 * PUT /api/company-admin/terminology
 * Updates group_label and user_label for the company (e.g. "House / Unit" and "Tenant").
 */
export async function PUT(request: Request) {
  try {
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    const body = await request.json().catch(() => ({}));
    const companyIdParam = body.company_id || profile.company_id;
    const companyId = requireUuid(companyIdParam, "company_id");

    assertCompanyAccess(profile, companyId);

    const groupLabel = requireText(body.group_label || "Department", "Group label", 60);
    const userLabel = requireText(body.user_label || "Host", "User label", 60);

    const { data, error } = await supabaseAdmin
      .from("companies")
      .update({
        group_label: groupLabel,
        user_label: userLabel,
      })
      .eq("id", companyId)
      .select("id, group_label, user_label")
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      group_label: data.group_label,
      user_label: data.user_label,
    });
  } catch (error) {
    console.error("Update terminology error:", error);
    const safeError = getSafeErrorResponse(error, "Failed to update workspace terminology.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

