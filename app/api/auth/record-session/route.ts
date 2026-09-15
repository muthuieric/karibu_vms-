import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { detectImpossibleTravel, type SessionLocation } from "@/lib/security/geo-travel";
import { getClientIp } from "@/lib/security/rate-limit";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function parseGeoCoordinate(value: string | null): number | null {
  if (!value) return null;
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : null;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : null;
    const body = await request.json().catch(() => ({}));
    const userIdFromBody = body.userId;

    const supabaseAdmin = getSupabaseAdmin();
    let authenticatedUserId: string | null = null;

    if (token) {
      const { data: authData } = await supabaseAdmin.auth.getUser(token);
      authenticatedUserId = authData?.user?.id || null;
    }

    const targetUserId = authenticatedUserId || userIdFromBody;
    if (!targetUserId) {
      return NextResponse.json({ error: "Unauthorized session recording" }, { status: 401 });
    }

    // Capture location and client headers
    const ipAddress = getClientIp(request.headers);
    const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || null;
    const city = request.headers.get("x-vercel-ip-city") || null;
    const latitude = parseGeoCoordinate(request.headers.get("x-vercel-ip-latitude"));
    const longitude = parseGeoCoordinate(request.headers.get("x-vercel-ip-longitude"));
    const userAgent = request.headers.get("user-agent") || "unknown";

    const currentSession: SessionLocation = {
      country,
      city,
      latitude,
      longitude,
      created_at: new Date().toISOString(),
    };

    // Retrieve previous session for this user
    const { data: previousSession } = await supabaseAdmin
      .from("user_sessions")
      .select("country, city, latitude, longitude, created_at")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Check for impossible travel anomaly
    const checkResult = detectImpossibleTravel(previousSession, currentSession);

    // Record the new session
    const { error: insertError } = await supabaseAdmin.from("user_sessions").insert([
      {
        user_id: targetUserId,
        ip_address: ipAddress,
        country: country || (ipAddress === "127.0.0.1" ? "Localhost" : "Unknown"),
        city: city || (ipAddress === "127.0.0.1" ? "Local Dev" : "Unknown"),
        latitude,
        longitude,
        user_agent: userAgent.slice(0, 500),
        is_suspicious: checkResult.isSuspicious,
        flag_reason: checkResult.isSuspicious ? checkResult.reason : null,
      },
    ]);

    if (insertError) {
      console.warn("Could not insert user_session (table may need migration):", insertError.message);
    }

    if (checkResult.isSuspicious) {
      console.warn(`[SECURITY ALERT] Impossible travel detected for user ${targetUserId}:`, checkResult.reason);

      // Flag account profile as compromised and require password reset
      try {
        await supabaseAdmin
          .from("profiles")
          .update({
            is_compromised: true,
            must_change_password: true,
          })
          .eq("id", targetUserId);
      } catch (profileUpdateErr) {
        console.warn("Could not set is_compromised on profile:", profileUpdateErr);
      }

      // Log into audit trail if audit_logs table exists
      try {
        await supabaseAdmin.from("audit_logs").insert([
          {
            user_id: targetUserId,
            action: "IMPOSSIBLE_TRAVEL_DETECTED",
            details: checkResult.reason,
            ip_address: ipAddress,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch {
        // Audit log insert optional
      }

      return NextResponse.json({
        success: true,
        compromised: true,
        flagReason: checkResult.reason,
      });
    }

    return NextResponse.json({
      success: true,
      compromised: false,
    });
  } catch (error) {
    console.error("Error in record-session API:", error);
    return NextResponse.json({ error: "Session recording failed" }, { status: 500 });
  }
}

