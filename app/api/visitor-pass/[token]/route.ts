import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/billing/server";

export const dynamic = "force-dynamic";

type VisitorPassRouteContext = {
  params: Promise<{ token: string }>;
};

function getDisplayName(name?: string | null) {
  const parts = String(name || "Visitor").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] || "Visitor";
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

function getPassStatus(status?: string | null, passExpiredAt?: string | null) {
  if (passExpiredAt) return "checked_out";
  if (status === "checked_in") return "approved";
  if (status === "checked_out" || status === "auto_checked_out") return "checked_out";
  if (status === "rejected") return "rejected";
  return "pending";
}

function canRevealPassCode(status?: string | null, passExpiredAt?: string | null) {
  return status === "checked_in" && !passExpiredAt;
}

export async function GET(_request: Request, context: VisitorPassRouteContext) {
  try {
    const { token } = await context.params;
    const normalizedToken = decodeURIComponent(token || "").trim();

    if (!normalizedToken || normalizedToken.length < 24) {
      return NextResponse.json({ error: "Pass not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    const supabaseAdmin = createSupabaseAdmin();
    const { data: visitor, error } = await supabaseAdmin
      .from("visitors")
      .select("name, host_name, status, created_at, checked_in_at, checked_out_at, pass_code, pass_expired_at, host_confirmed_at, company_id, gate_id")
      .eq("pass_token", normalizedToken)
      .maybeSingle();

    if (error) throw error;
    if (!visitor) {
      return NextResponse.json({ error: "Pass not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    const [{ data: company }, { data: gate }] = await Promise.all([
      supabaseAdmin.from("companies").select("name").eq("id", visitor.company_id).maybeSingle(),
      visitor.gate_id
        ? supabaseAdmin.from("gates").select("name").eq("id", visitor.gate_id).eq("company_id", visitor.company_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    return NextResponse.json(
      {
        data: {
          visitorName: getDisplayName(visitor.name),
          hostName: visitor.host_name || null,
          companyName: company?.name || "Karibu VMS",
          gateName: gate?.name || null,
          status: getPassStatus(visitor.status, visitor.pass_expired_at),
          date: visitor.created_at || null,
          checkedInAt: visitor.checked_in_at || null,
          checkedOutAt: visitor.checked_out_at || visitor.pass_expired_at || null,
          passCode: canRevealPassCode(visitor.status, visitor.pass_expired_at) ? visitor.pass_code || null : null,
          passExpiredAt: visitor.pass_expired_at || null,
          hostConfirmedAt: visitor.host_confirmed_at || null,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Visitor pass lookup failed:", error);
    return NextResponse.json(
      { error: "Pass could not be loaded." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
