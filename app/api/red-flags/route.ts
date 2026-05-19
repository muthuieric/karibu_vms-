import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { assertResourceCompanyAccess } from "@/lib/api-resources";
import { optionalText, requireText, requireUuid } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { company_id, name, id_number, phone, reason } = await request.json();
    const companyId = requireUuid(company_id, "company_id");
    const visitorName = requireText(name, "Visitor name", 120);
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "guard", "superadmin"]);
    assertCompanyAccess(profile, companyId);

    const { data, error } = await supabaseAdmin
      .from("red_flags")
      .insert([{ company_id: companyId, name: visitorName, id_number: optionalText(id_number, 60), phone: optionalText(phone, 40), reason: optionalText(reason, 500) }])
      .select("id, company_id, name, id_number, phone, reason, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Red flag create error:", error);
    const safeError = getSafeErrorResponse(error, "Restricted visitor record could not be created.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = requireUuid(searchParams.get("company_id"), "company_id");
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "guard", "superadmin"]);
    assertCompanyAccess(profile, companyId);

    const { data, error } = await supabaseAdmin
      .from("red_flags")
      .select("id, name, id_number, phone, reason, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Red flag list error:", error);
    const safeError = getSafeErrorResponse(error, "Restricted visitor records could not be loaded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const redFlagId = requireUuid(searchParams.get("id"), "redFlagId");
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    await assertResourceCompanyAccess(supabaseAdmin, profile, "red_flags", redFlagId);

    const { error } = await supabaseAdmin.from("red_flags").delete().eq("id", redFlagId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Red flag delete error:", error);
    const safeError = getSafeErrorResponse(error, "Restricted visitor record could not be deleted.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
