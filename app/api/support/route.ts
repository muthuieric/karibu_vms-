import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireText, requireUuid } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const rateLimited = checkRateLimit(request, { keyPrefix: "support-ticket", limit: 5, windowMs: 60_000 });
    if (rateLimited) return rateLimited;

    const { company_id, subject, description } = await request.json();
    const companyId = requireUuid(company_id, "company_id");
    const safeSubject = requireText(subject, "Subject", 160);
    const safeDescription = requireText(description, "Description", 2_000);
    const { user, profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    assertCompanyAccess(profile, companyId);

    const { data, error } = await supabaseAdmin
      .from("support_tickets")
      .insert([{ company_id: companyId, subject: safeSubject, description: safeDescription, created_by: user.id }])
      .select("id, subject, description, status, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Support ticket create error:", error);
    const safeError = getSafeErrorResponse(error, "Support ticket could not be submitted.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = requireUuid(searchParams.get("company_id"), "company_id");
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    assertCompanyAccess(profile, companyId);

    const { data, error } = await supabaseAdmin
      .from("support_tickets")
      .select("id, subject, description, status, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Support ticket list error:", error);
    const safeError = getSafeErrorResponse(error, "Support tickets could not be loaded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
