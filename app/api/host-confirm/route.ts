import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/billing/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireUuid } from "@/lib/validation";

type HostConfirmPayload = {
  companyId?: string;
  code?: string;
  otp?: string;
};

function normalizeVisitorCode(value: unknown) {
  const code = String(value || "").trim();
  if (!/^\d{4,6}$/.test(code)) {
    throw Object.assign(new Error("Enter a valid visitor code."), { status: 400 });
  }
  return code;
}

function safeError(error: unknown) {
  const status = typeof error === "object" && error && "status" in error ? Number((error as { status?: number }).status) : 500;
  const safeStatus = Number.isInteger(status) && status >= 400 && status < 600 ? status : 500;
  return {
    status: safeStatus,
    message: safeStatus >= 500 ? "Visit could not be confirmed." : error instanceof Error ? error.message : "Visit could not be confirmed.",
  };
}

export async function POST(request: Request) {
  const rateLimitResponse = checkRateLimit(request, { keyPrefix: "host-confirm", limit: 20, windowMs: 60_000 });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const payload = (await request.json()) as HostConfirmPayload;
    const companyId = requireUuid(payload.companyId, "companyId");
    const code = normalizeVisitorCode(payload.code || payload.otp);
    const now = new Date().toISOString();
    const supabaseAdmin = createSupabaseAdmin();

    const { data: visitors, error: visitorError } = await supabaseAdmin
      .from("visitors")
      .select("id, company_id, name, host_name, status, checked_out_at, pass_expired_at, pass_code, otp_code")
      .eq("company_id", companyId)
      .or(`pass_code.eq.${code},otp_code.eq.${code}`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (visitorError) throw visitorError;

    const visitor = visitors?.[0];
    if (!visitor) {
      return NextResponse.json({ error: "No active visitor was found for that code." }, { status: 404 });
    }

    if (visitor.status === "pending") {
      return NextResponse.json({ error: "This visitor has not been approved by security yet." }, { status: 409 });
    }

    if (visitor.status === "checked_out" || visitor.status === "auto_checked_out" || visitor.checked_out_at) {
      return NextResponse.json({ error: "This visitor has already been checked out." }, { status: 409 });
    }

    if (visitor.pass_expired_at) {
      return NextResponse.json({ error: "This visitor code has expired." }, { status: 409 });
    }

    if (visitor.status !== "checked_in") {
      return NextResponse.json({ error: "Only checked-in visitors can be checked out." }, { status: 409 });
    }

    const { data: updatedVisitor, error: updateError } = await supabaseAdmin
      .from("visitors")
      .update({
        status: "checked_out",
        checked_out_at: now,
        pass_expired_at: now,
        host_confirmed: true,
        host_confirmed_at: now,
        otp_code: null,
      })
      .eq("id", visitor.id)
      .eq("company_id", companyId)
      .eq("status", "checked_in")
      .is("pass_expired_at", null)
      .select("name, host_name, checked_out_at")
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      visitor: {
        name: updatedVisitor.name,
        hostName: updatedVisitor.host_name || null,
        checkedOutAt: updatedVisitor.checked_out_at,
      },
      message: `${updatedVisitor.name} has been checked out.`,
    });
  } catch (error) {
    console.error("Host Confirm API Error:", error);
    const response = safeError(error);
    return NextResponse.json({ error: response.message }, { status: response.status });
  }
}
