import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { assertResourceCompanyAccess } from "@/lib/api-resources";
import { requireText, requireUuid } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { company_id, name } = await request.json();
    const companyId = requireUuid(company_id, "company_id");
    const gateName = requireText(name, "Gate name", 100);
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    assertCompanyAccess(profile, companyId);

    const { data, error } = await supabaseAdmin
      .from("gates")
      .insert([{ company_id: companyId, name: gateName }])
      .select("id, company_id, name, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Gate create error:", error);
    const safeError = getSafeErrorResponse(error, "Gate could not be created.");
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
      .from("gates")
      .select("id, name")
      .eq("company_id", companyId)
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Gate list error:", error);
    const safeError = getSafeErrorResponse(error, "Gates could not be loaded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();
    const gateId = requireUuid(id, "gateId");
    const gateName = requireText(name, "Gate name", 100);
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    await assertResourceCompanyAccess(supabaseAdmin, profile, "gates", gateId);

    const { data, error } = await supabaseAdmin
      .from("gates")
      .update({ name: gateName })
      .eq("id", gateId)
      .select("id, company_id, name, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Gate update error:", error);
    const safeError = getSafeErrorResponse(error, "Gate could not be updated.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gateId = requireUuid(searchParams.get("id"), "gateId");
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    await assertResourceCompanyAccess(supabaseAdmin, profile, "gates", gateId);

    const { error } = await supabaseAdmin.from("gates").delete().eq("id", gateId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gate delete error:", error);
    const safeError = getSafeErrorResponse(error, "Gate could not be deleted.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
