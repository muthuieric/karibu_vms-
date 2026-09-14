import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { optionalText, requireText, requireUuid } from "@/lib/validation";
import { encryptValue, getActiveHashKeyId, getLast4, hmacValue, normalizePhone } from "@/lib/crypto-fields";
import { createVisitorPassToken, getVisitorPassUrl } from "@/lib/visitor-pass";

function encryptedPhoneSet(phone?: string | null) {
  if (!phone) {
    return { encrypted: null, hash: null, last4: null, normalized: "" };
  }
  const normalized = normalizePhone(phone);
  if (!normalized) {
    return { encrypted: null, hash: null, last4: null, normalized: "" };
  }
  return {
    encrypted: encryptValue(normalized),
    hash: hmacValue(normalized),
    last4: getLast4(normalized),
    normalized,
  };
}

async function resolveHostRecord(
  supabaseAdmin: Awaited<ReturnType<typeof requireRole>>["supabaseAdmin"],
  profile: Awaited<ReturnType<typeof requireRole>>["profile"],
  userId: string,
  userEmail?: string | null,
  overrideHostId?: string | null
) {
  if (overrideHostId && (profile.role === "company_admin" || profile.role === "superadmin")) {
    const { data: host } = await supabaseAdmin
      .from("hosts")
      .select("id, company_id, department_id, name, email, phone")
      .eq("id", overrideHostId)
      .maybeSingle();
    if (host) return host;
  }

  // 1. By user_id
  let { data: host } = await supabaseAdmin
    .from("hosts")
    .select("id, company_id, department_id, name, email, phone")
    .eq("user_id", userId)
    .maybeSingle();

  // 2. By email + company_id fallback
  if (!host && userEmail && profile.company_id) {
    const { data: fallbackHost } = await supabaseAdmin
      .from("hosts")
      .select("id, company_id, department_id, name, email, phone")
      .ilike("email", userEmail.trim())
      .eq("company_id", profile.company_id)
      .maybeSingle();

    if (fallbackHost) {
      host = fallbackHost;
      // Self-heal user_id link
      await supabaseAdmin.from("hosts").update({ user_id: userId }).eq("id", fallbackHost.id);
    }
  }

  // 3. Fallback for company_admin / superadmin preview: pick the first host of the company
  if (!host && (profile.role === "company_admin" || profile.role === "superadmin") && profile.company_id) {
    const { data: firstHost } = await supabaseAdmin
      .from("hosts")
      .select("id, company_id, department_id, name, email, phone")
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (firstHost) {
      host = firstHost;
    }
  }

  return host;
}

export async function GET(request: Request) {
  try {
    const { profile, user, supabaseAdmin } = await requireRole(request, ["host", "company_admin", "superadmin"]);
    const { searchParams } = new URL(request.url);
    const requestedHostId = searchParams.get("host_id");

    const host = await resolveHostRecord(supabaseAdmin, profile, user.id, user.email, requestedHostId);

    if (!host) {
      return NextResponse.json({
        error: "No host record found. If you are an administrator, please add a host in the Departments & Hosts section first.",
        noHosts: true,
      }, { status: 404 });
    }

    const companyId = host.company_id;
    assertCompanyAccess(profile, companyId);

    const isAdmin = profile.role === "company_admin" || profile.role === "superadmin";

    const [{ data: company }, { data: rawVisitors, error: visitorsError }, { data: allHosts }] = await Promise.all([
      supabaseAdmin
        .from("companies")
        .select("id, name, logo_url")
        .eq("id", companyId)
        .single(),
      supabaseAdmin
        .from("visitors")
        .select("id, company_id, name, status, expected_arrival, is_pre_registered, pre_registered_by, host_id, host_name, purpose, created_at, checked_in_at, checked_out_at, phone_last4, pass_token, pass_code")
        .eq("company_id", companyId)
        .or(`host_id.eq.${host.id},pre_registered_by.eq.${host.id}`)
        .order("created_at", { ascending: false })
        .limit(100),
      isAdmin
        ? supabaseAdmin
            .from("hosts")
            .select("id, name, department_id, email, phone")
            .eq("company_id", companyId)
            .order("name", { ascending: true })
        : Promise.resolve({ data: [] }),
    ]);

    if (visitorsError) throw visitorsError;

    const visitors = (rawVisitors || []).map((v) => ({
      ...v,
      passUrl: v.pass_token ? getVisitorPassUrl(v.pass_token) : null,
    }));

    return NextResponse.json({
      data: {
        host,
        company,
        visitors,
        allHosts: allHosts || [],
        isAdminPreview: isAdmin,
      },
    });
  } catch (error) {
    console.error("Host visitors GET error:", error);
    const safeError = getSafeErrorResponse(error, "Could not load visitors.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function POST(request: Request) {
  try {
    const { profile, user, supabaseAdmin } = await requireRole(request, ["host", "company_admin", "superadmin"]);
    const body = await request.json();
    const { name, phone, purpose, expected_arrival, host_id } = body;

    const visitorName = requireText(name, "Visitor name", 120);
    const expectedArrivalRaw = requireText(expected_arrival, "Expected arrival date & time", 60);

    const expectedArrivalDate = new Date(expectedArrivalRaw);
    if (isNaN(expectedArrivalDate.getTime())) {
      return NextResponse.json({ error: "Invalid expected arrival date/time." }, { status: 400 });
    }

    const host = await resolveHostRecord(supabaseAdmin, profile, user.id, user.email, host_id);
    if (!host) {
      return NextResponse.json({ error: "Host record not found." }, { status: 404 });
    }

    assertCompanyAccess(profile, host.company_id);

    const phoneFields = encryptedPhoneSet(phone);
    const passToken = createVisitorPassToken();
    const now = new Date();
    const activeHashKeyId = getActiveHashKeyId();
    const retentionDays = 180;
    const deleteAfter = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000).toISOString();

    const insertPayload = {
      company_id: host.company_id,
      name: visitorName,
      phone: null,
      phone_encrypted: phoneFields.encrypted,
      phone_hash: phoneFields.hash,
      phone_last4: phoneFields.last4,
      host_id: host.id,
      host_name: host.name,
      pre_registered_by: host.id,
      status: "pre_registered",
      is_pre_registered: true,
      expected_arrival: expectedArrivalDate.toISOString(),
      purpose: optionalText(purpose, 255),
      pass_token: passToken,
      hash_key_id: activeHashKeyId,
      retention_days: retentionDays,
      delete_after: deleteAfter,
      custom_data: { source: "host_portal" },
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("visitors")
      .insert([insertPayload])
      .select("id, company_id, name, status, expected_arrival, is_pre_registered, pre_registered_by, host_id, host_name, purpose, created_at, phone_last4, pass_token, pass_code")
      .single();

    if (insertError) throw insertError;

    const passUrl = getVisitorPassUrl(passToken);

    return NextResponse.json({
      data: {
        ...inserted,
        passUrl,
      },
      message: "Visitor pre-registered successfully.",
    }, { status: 201 });
  } catch (error) {
    console.error("Host visitor create error:", error);
    const safeError = getSafeErrorResponse(error, "Could not pre-register visitor.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function PATCH(request: Request) {
  try {
    const { profile, user, supabaseAdmin } = await requireRole(request, ["host", "company_admin", "superadmin"]);
    const body = await request.json();
    const visitorId = requireUuid(body.visitor_id, "visitor_id");
    const action = body.action === "delete" ? "delete" : "cancel";

    const host = await resolveHostRecord(supabaseAdmin, profile, user.id, user.email, body.host_id);
    if (!host) {
      return NextResponse.json({ error: "Host record not found." }, { status: 404 });
    }

    assertCompanyAccess(profile, host.company_id);

    // Verify visitor belongs to this host/company
    const { data: visitor, error: fetchError } = await supabaseAdmin
      .from("visitors")
      .select("id, company_id, host_id, pre_registered_by, status")
      .eq("id", visitorId)
      .eq("company_id", host.company_id)
      .single();

    if (fetchError || !visitor) {
      return NextResponse.json({ error: "Visitor not found or unauthorized." }, { status: 404 });
    }

    if (profile.role === "host" && visitor.host_id !== host.id && visitor.pre_registered_by !== host.id) {
      return NextResponse.json({ error: "Unauthorized to modify this visitor." }, { status: 403 });
    }

    if (action === "delete") {
      const { error: deleteError } = await supabaseAdmin
        .from("visitors")
        .delete()
        .eq("id", visitorId);

      if (deleteError) throw deleteError;

      return NextResponse.json({ success: true, message: "Visitor record deleted." });
    } else {
      const { error: updateError } = await supabaseAdmin
        .from("visitors")
        .update({ status: "cancelled" })
        .eq("id", visitorId);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, message: "Visitor pre-registration revoked." });
    }
  } catch (error) {
    console.error("Host visitor PATCH error:", error);
    const safeError = getSafeErrorResponse(error, "Could not update visitor.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

