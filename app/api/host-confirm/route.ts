import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

// Use the Service Role Key to bypass RLS securely on the backend
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { visitorId, companyId, otp, action } = await request.json();

    if (!companyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action === "lookup") {
      if (!otp || typeof otp !== "string") {
        return NextResponse.json({ error: "OTP code is required" }, { status: 400 });
      }

      const { data: visitor, error } = await supabaseAdmin
        .from("visitors")
        .select("id, name, phone, purpose, photo_url, host_confirmed, status, created_at, checked_in_at")
        .eq("company_id", companyId)
        .eq("otp_code", otp.trim())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Supabase Lookup Error:", error);
        throw error;
      }

      if (!visitor) {
        return NextResponse.json({ error: "No active visitor found with this OTP code." }, { status: 404 });
      }

      return NextResponse.json({ success: true, visitor });
    }

    if (!visitorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update ONLY the new host_confirmed column we added.
    // We intentionally DO NOT update 'status' here to avoid the 500 enum error.
    const { error } = await supabaseAdmin
      .from("visitors")
      .update({ 
        host_confirmed: true 
      })
      .eq("id", visitorId)
      .eq("company_id", companyId);

    if (error) {
      console.error("Supabase Update Error:", error);
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error("Host Confirm API Error:", error);
    return NextResponse.json({ error: "Failed to confirm visitor." }, { status: 500 });
  }
}
