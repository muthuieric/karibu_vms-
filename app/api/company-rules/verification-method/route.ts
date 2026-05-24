import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { requireUuid } from "@/lib/validation";
import { canChooseVerificationMethod, isVerificationMethod } from "@/lib/visitor-verification";

export async function PATCH(request: Request) {
  try {
    const { companyId, verificationMethod } = await request.json();
    const safeCompanyId = requireUuid(companyId, "companyId");
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    assertCompanyAccess(profile, safeCompanyId);

    if (!isVerificationMethod(verificationMethod)) {
      return NextResponse.json({ error: "Invalid verification method." }, { status: 400 });
    }

    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .select("plan_tier")
      .eq("id", safeCompanyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    if (!canChooseVerificationMethod(company.plan_tier)) {
      return NextResponse.json(
        { error: "Verification method selection is available on Premium." },
        { status: 403 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("companies")
      .update({ visitor_verification_method: verificationMethod })
      .eq("id", safeCompanyId);

    if (updateError) throw updateError;

    return NextResponse.json({ data: { visitorVerificationMethod: verificationMethod } });
  } catch (error) {
    console.error("Verification method update failed:", error);
    const safeError = getSafeErrorResponse(error, "Verification method could not be updated.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
