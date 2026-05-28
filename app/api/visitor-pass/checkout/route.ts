import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";

type CheckoutPassPayload = {
  visitorId?: string;
};

const GUARD_SAFE_VISITOR_SELECT = "id, company_id, gate_id, name, phone_last4, document_type, id_number_last4, vehicle_reg_last4, status, created_at, checked_in_at, checked_out_at, host_id, host_name, host_confirmed, host_confirmed_at, purpose, photo_url, custom_data, otp_code, pass_token, pass_code, pass_expired_at, verification_method";

export async function POST(request: Request) {
  try {
    const auth = await requireRole(request, ["guard", "company_admin", "superadmin"]);
    const payload = (await request.json()) as CheckoutPassPayload;
    const visitorId = String(payload.visitorId || "").trim();

    if (!visitorId) {
      return NextResponse.json({ error: "Visitor is required." }, { status: 400 });
    }

    const { data: visitor, error: visitorError } = await auth.supabaseAdmin
      .from("visitors")
      .select("id, company_id, gate_id, status")
      .eq("id", visitorId)
      .single();

    if (visitorError || !visitor) {
      return NextResponse.json({ error: "Visitor not found." }, { status: 404 });
    }

    assertCompanyAccess(auth.profile, visitor.company_id);

    if (auth.profile.role === "guard" && auth.profile.company_id) {
      const { data: guardProfile } = await auth.supabaseAdmin
        .from("profiles")
        .select("gate_id")
        .eq("id", auth.profile.id)
        .eq("company_id", visitor.company_id)
        .single();

      if (guardProfile?.gate_id && visitor.gate_id && guardProfile.gate_id !== visitor.gate_id) {
        return NextResponse.json({ error: "You can only check out visitors assigned to your gate." }, { status: 403 });
      }
    }

    if (visitor.status !== "checked_in") {
      return NextResponse.json({ error: "Only checked-in visitors can be checked out." }, { status: 409 });
    }

    const checkedOutAt = new Date().toISOString();
    const { data: updatedVisitor, error: updateError } = await auth.supabaseAdmin
      .from("visitors")
      .update({
        status: "checked_out",
        checked_out_at: checkedOutAt,
        pass_expired_at: checkedOutAt,
        otp_code: null,
      })
      .eq("id", visitor.id)
      .eq("company_id", visitor.company_id)
      .eq("status", "checked_in")
      .select(GUARD_SAFE_VISITOR_SELECT)
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ data: updatedVisitor });
  } catch (error) {
    console.error("Visitor checkout failed:", error);
    const safeError = getSafeErrorResponse(error, "Visitor could not be checked out.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
