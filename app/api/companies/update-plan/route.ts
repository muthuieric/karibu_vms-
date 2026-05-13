import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { companyId, planTier } = await request.json();

    if (!companyId || !planTier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Securely update the plan_tier column using Service Role
    const { error: updateError } = await supabaseAdmin
      .from("companies")
      .update({ plan_tier: planTier })
      .eq("id", companyId);

    if (updateError) throw updateError;

    // Ensure all guards are unlocked regardless of plan
    await supabaseAdmin
      .from("profiles")
      .update({ is_locked: false })
      .eq("company_id", companyId)
      .eq("role", "guard");

    return NextResponse.json({ success: true, newTier: planTier });

  } catch (error: unknown) {
    console.error("Update Plan Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
