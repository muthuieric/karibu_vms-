import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { createVisitorPassCode } from "@/lib/visitor-pass";
import { isQrPassBackendEnabledForPlan, resolveEffectiveVisitorVerificationMethod } from "@/lib/visitor-verification";

type ApprovePassPayload = {
  visitorId?: string;
  passToken?: string;
};

const MAX_PASS_CODE_ATTEMPTS = 12;
const GUARD_SAFE_VISITOR_SELECT = "id, company_id, gate_id, name, phone_last4, document_type, id_number_last4, vehicle_reg_last4, status, created_at, checked_in_at, host_id, host_name, host_confirmed, host_confirmed_at, purpose, photo_url, custom_data, otp_code, pass_token, pass_code, pass_expired_at, verification_method";

function isUniqueConstraintError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string; details?: string };
  const text = `${candidate.message || ""} ${candidate.details || ""}`.toLowerCase();
  return candidate.code === "23505" || text.includes("duplicate key") || text.includes("unique constraint");
}

export async function POST(request: Request) {
  try {
    const auth = await requireRole(request, ["guard", "company_admin", "superadmin"]);
    const payload = (await request.json()) as ApprovePassPayload;
    const visitorId = String(payload.visitorId || "").trim();
    const passToken = String(payload.passToken || "").trim();

    if (!visitorId && !passToken) {
      return NextResponse.json({ error: "Visitor pass is required." }, { status: 400 });
    }

    let query = auth.supabaseAdmin
      .from("visitors")
      .select("id, company_id, gate_id, status, pass_token, pass_expired_at, verification_method")
      .limit(1);

    query = visitorId ? query.eq("id", visitorId) : query.eq("pass_token", passToken);

    const { data: visitors, error: visitorError } = await query;
    if (visitorError) throw visitorError;

    const visitor = visitors?.[0];
    if (!visitor || !visitor.pass_token) {
      return NextResponse.json({ error: "Visitor pass not found." }, { status: 404 });
    }

    if (visitor.pass_expired_at) {
      return NextResponse.json({ error: "This visitor pass has expired." }, { status: 409 });
    }

    assertCompanyAccess(auth.profile, visitor.company_id);

    const { data: company, error: companyError } = await auth.supabaseAdmin
      .from("companies")
      .select("plan_tier, visitor_verification_method")
      .eq("id", visitor.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    const effectiveVerificationMethod = resolveEffectiveVisitorVerificationMethod(
      company.plan_tier,
      visitor.verification_method,
      company.visitor_verification_method
    );

    if (effectiveVerificationMethod !== "qr_pass") {
      return NextResponse.json({ error: "QR Pass is not enabled for this workspace." }, { status: 403 });
    }

    if (!isQrPassBackendEnabledForPlan(company.plan_tier)) {
      return NextResponse.json(
        { error: "QR Pass is selected but not enabled in environment settings." },
        { status: 403 }
      );
    }

    if (auth.profile.role === "guard" && auth.profile.company_id) {
      const { data: guardProfile } = await auth.supabaseAdmin
        .from("profiles")
        .select("gate_id")
        .eq("id", auth.profile.id)
        .eq("company_id", visitor.company_id)
        .single();

      if (guardProfile?.gate_id && visitor.gate_id && guardProfile.gate_id !== visitor.gate_id) {
        return NextResponse.json({ error: "You can only approve visitors assigned to your gate." }, { status: 403 });
      }
    }

    if (visitor.status !== "pending") {
      return NextResponse.json({ error: "Only pending passes can be approved." }, { status: 409 });
    }

    let lastUniqueError: unknown = null;
    for (let attempt = 0; attempt < MAX_PASS_CODE_ATTEMPTS; attempt += 1) {
      const checkedInAt = new Date().toISOString();
      const passCode = createVisitorPassCode();
      const { data: existingCode, error: codeError } = await auth.supabaseAdmin
        .from("visitors")
        .select("id")
        .eq("company_id", visitor.company_id)
        .eq("pass_code", passCode)
        .is("checked_out_at", null)
        .is("pass_expired_at", null)
        .neq("id", visitor.id)
        .limit(1);

      if (codeError) throw codeError;
      if (existingCode?.length) {
        continue;
      }

      const { data: updatedVisitor, error: updateError } = await auth.supabaseAdmin
        .from("visitors")
        .update({
          status: "checked_in",
          checked_in_at: checkedInAt,
          pass_code: passCode,
          verification_method: "qr_pass",
        })
        .eq("id", visitor.id)
        .eq("company_id", visitor.company_id)
        .eq("status", "pending")
        .is("checked_out_at", null)
        .is("pass_expired_at", null)
        .select(GUARD_SAFE_VISITOR_SELECT)
        .single();

      if (!updateError) {
        return NextResponse.json({ data: updatedVisitor });
      }

      if (isUniqueConstraintError(updateError)) {
        lastUniqueError = updateError;
        continue;
      }

      throw updateError;
    }

    console.error("Visitor pass code generation exhausted retries:", lastUniqueError);
    return NextResponse.json({ error: "Visitor pass code could not be generated. Please try again." }, { status: 409 });
  } catch (error) {
    console.error("Visitor pass approval failed:", error);
    const safeError = getSafeErrorResponse(error, "Visitor pass could not be approved.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
