import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/billing/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];

    let body: { userId?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Empty body allowed
    }

    const supabaseAdmin = createSupabaseAdmin();
    let targetUserId = body.userId;

    // If token provided, verify it
    if (token) {
      const supabaseAnon = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: authData } = await supabaseAnon.auth.getUser(token);
      if (authData?.user?.id) {
        targetUserId = authData.user.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
    }

    // 1. Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, company_id, role, full_name, email")
      .eq("id", targetUserId)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({ success: true, profile: existingProfile });
    }

    // 2. Fetch auth user to get metadata
    const { data: authUserResult, error: authUserErr } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    if (authUserErr || !authUserResult?.user) {
      return NextResponse.json({ error: "User not found in auth service" }, { status: 404 });
    }

    const user = authUserResult.user;
    const meta = user.user_metadata || {};
    let role = (meta.role || "").trim().toLowerCase();
    let companyId = meta.companyId || meta.company_id || null;
    let fullName = meta.name || meta.full_name || null;
    const email = user.email || null;

    // 3. If host or no companyId, search hosts table
    const { data: matchedHost } = await supabaseAdmin
      .from("hosts")
      .select("id, company_id, name, email")
      .or(`user_id.eq.${targetUserId},email.ilike.${email || "NONE"}`)
      .maybeSingle();

    if (matchedHost) {
      role = role || "host";
      companyId = companyId || matchedHost.company_id;
      fullName = fullName || matchedHost.name;

      // Link host user_id if not yet set
      await supabaseAdmin
        .from("hosts")
        .update({ user_id: targetUserId })
        .eq("id", matchedHost.id);
    }

    // Default to 'host' if created through host flow or metadata says host
    if (!role && matchedHost) {
      role = "host";
    }

    // If still no role, check if admin or guard
    if (!role) {
      role = "host";
    }

    // 4. Upsert into profiles table
    let savedProfile = null;
    try {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: targetUserId,
            company_id: companyId,
            role,
            full_name: fullName || email || "User",
            email,
            must_change_password: meta.must_change_password ?? true,
          },
          { onConflict: "id" }
        )
        .select("id, company_id, role, full_name, email")
        .maybeSingle();

      if (insertErr) {
        console.warn("profile-sync upsert warning:", insertErr.message);
        // Fallback without must_change_password if column doesn't exist yet
        const { data: fallbackInserted } = await supabaseAdmin
          .from("profiles")
          .upsert(
            {
              id: targetUserId,
              company_id: companyId,
              role,
              full_name: fullName || email || "User",
            },
            { onConflict: "id" }
          )
          .select("id, company_id, role, full_name, email")
          .maybeSingle();

        savedProfile = fallbackInserted;
      } else {
        savedProfile = inserted;
      }
    } catch (dbErr) {
      console.warn("profile-sync database exception:", dbErr);
    }

    // Return the saved profile or fallback object
    const finalProfile = savedProfile || {
      id: targetUserId,
      company_id: companyId,
      role,
      full_name: fullName || "User",
      email,
    };

    return NextResponse.json({ success: true, profile: finalProfile });
  } catch (err) {
    console.error("profile-sync unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to sync profile" },
      { status: 500 }
    );
  }
}

