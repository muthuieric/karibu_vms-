import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { assertResourceCompanyAccess } from "@/lib/api-resources";
import { optionalText, requireText, requireUuid } from "@/lib/validation";

async function assertDepartmentBelongsToCompany(supabaseAdmin: Awaited<ReturnType<typeof requireRole>>["supabaseAdmin"], departmentId: string, companyId: string) {
  const { data, error } = await supabaseAdmin
    .from("departments")
    .select("id")
    .eq("id", departmentId)
    .eq("company_id", companyId)
    .single();

  if (error || !data) {
    throw Object.assign(new Error("Invalid department."), { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const { company_id, department_id, name, phone, email } = await request.json();
    const companyId = requireUuid(company_id, "company_id");
    const departmentId = requireUuid(department_id, "department_id");
    const hostName = requireText(name, "Host name", 120);
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    assertCompanyAccess(profile, companyId);
    await assertDepartmentBelongsToCompany(supabaseAdmin, departmentId, companyId);

    const { data, error } = await supabaseAdmin
      .from("hosts")
      .insert([{ company_id: companyId, department_id: departmentId, name: hostName, phone: optionalText(phone, 30), email: optionalText(email, 160) }])
      .select("id, company_id, department_id, name, phone, email, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Host create error:", error);
    const safeError = getSafeErrorResponse(error, "Host could not be created.");
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
      .from("hosts")
      .select("id, department_id, name, phone, email")
      .eq("company_id", companyId)
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Host list error:", error);
    const safeError = getSafeErrorResponse(error, "Hosts could not be loaded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, phone, email } = await request.json();
    const hostId = requireUuid(id, "hostId");
    const hostName = requireText(name, "Host name", 120);
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    await assertResourceCompanyAccess(supabaseAdmin, profile, "hosts", hostId);

    const { data, error } = await supabaseAdmin
      .from("hosts")
      .update({ name: hostName, phone: optionalText(phone, 30), email: optionalText(email, 160) })
      .eq("id", hostId)
      .select("id, company_id, department_id, name, phone, email, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Host update error:", error);
    const safeError = getSafeErrorResponse(error, "Host could not be updated.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = requireUuid(searchParams.get("id"), "hostId");
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    await assertResourceCompanyAccess(supabaseAdmin, profile, "hosts", hostId);

    const { error } = await supabaseAdmin.from("hosts").delete().eq("id", hostId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Host delete error:", error);
    const safeError = getSafeErrorResponse(error, "Host could not be deleted.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
