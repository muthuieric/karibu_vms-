import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { assertResourceCompanyAccess } from "@/lib/api-resources";
import { requireText, requireUuid } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { company_id, name } = await request.json();
    const companyId = requireUuid(company_id, "company_id");
    const departmentName = requireText(name, "Department name", 100);
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    assertCompanyAccess(profile, companyId);

    const { data, error } = await supabaseAdmin
      .from("departments")
      .insert([{ company_id: companyId, name: departmentName }])
      .select("id, company_id, name, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Department create error:", error);
    const safeError = getSafeErrorResponse(error, "Department could not be created.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = requireUuid(searchParams.get("company_id"), "company_id");
    const authHeader = request.headers.get("authorization");

    let supabaseAdmin;
    if (authHeader) {
      const auth = await requireRole(request, ["company_admin", "guard", "superadmin"]);
      supabaseAdmin = auth.supabaseAdmin;
      assertCompanyAccess(auth.profile, companyId);
    } else {
      const { createSupabaseAdmin } = await import("@/lib/billing/server");
      supabaseAdmin = createSupabaseAdmin();
    }

    const { data, error } = await supabaseAdmin
      .from("departments")
      .select("id, name")
      .eq("company_id", companyId)
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Department list error:", error);
    const safeError = getSafeErrorResponse(error, "Departments could not be loaded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();
    const departmentId = requireUuid(id, "departmentId");
    const departmentName = requireText(name, "Department name", 100);
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    await assertResourceCompanyAccess(supabaseAdmin, profile, "departments", departmentId);

    const { data, error } = await supabaseAdmin
      .from("departments")
      .update({ name: departmentName })
      .eq("id", departmentId)
      .select("id, company_id, name, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Department update error:", error);
    const safeError = getSafeErrorResponse(error, "Department could not be updated.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = requireUuid(searchParams.get("id"), "departmentId");
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    await assertResourceCompanyAccess(supabaseAdmin, profile, "departments", departmentId);

    const { error } = await supabaseAdmin.from("departments").delete().eq("id", departmentId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Department delete error:", error);
    const safeError = getSafeErrorResponse(error, "Department could not be deleted.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
