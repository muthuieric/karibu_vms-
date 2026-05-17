import { NextResponse } from "next/server";
import { getCurrentBillingSummary } from "@/lib/billing/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId." }, { status: 400 });
    }

    const summary = await getCurrentBillingSummary(companyId);
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load billing summary.";
    console.error("Billing summary error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
