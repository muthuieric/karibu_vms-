import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/billing/server";
import { getSafeErrorResponse, requireRole } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireRole(request, ["superadmin"]);
    const supabaseAdmin = createSupabaseAdmin();
    const { count, error } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "guard");

    if (error) throw error;
    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Guards count query error:", error);
    const safeError = getSafeErrorResponse(error, "Guards count could not be loaded.");
    return NextResponse.json({ count: 0, error: safeError.message }, { status: safeError.status });
  }
}
