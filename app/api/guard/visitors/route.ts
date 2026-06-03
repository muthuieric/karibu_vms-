import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { decryptValue } from "@/lib/crypto-fields";
import { writeAuditLog } from "@/lib/audit-log";

const ACTIVE_STATUSES = ["pending", "checked_in"];

const EMPTY_STATS = {
  totalToday: 0,
  pendingCount: 0,
  checkedInCount: 0,
  checkedOutCount: 0,
};

const GUARD_VISITOR_SELECT = [
  "id",
  "company_id",
  "gate_id",
  "name",
  "phone",
  "phone_encrypted",
  "document_type",
  "id_number",
  "id_number_encrypted",
  "vehicle_reg",
  "vehicle_reg_encrypted",
  "status",
  "created_at",
  "checked_in_at",
  "host_id",
  "host_name",
  "host_confirmed",
  "host_confirmed_at",
  "purpose",
  "photo_url",
  "custom_data",
  "otp_code",
  "pass_token",
  "pass_code",
  "pass_expired_at",
  "verification_method",
].join(",");

function decryptOrLegacy(encrypted?: string | null, legacy?: string | null) {
  return decryptValue(encrypted || null) || legacy || "";
}

function getKenyaDayRange(now = new Date()) {
  const kenyaOffsetMs = 3 * 60 * 60 * 1000;
  const kenyaNow = new Date(now.getTime() + kenyaOffsetMs);
  const startUtcMs = Date.UTC(
    kenyaNow.getUTCFullYear(),
    kenyaNow.getUTCMonth(),
    kenyaNow.getUTCDate()
  ) - kenyaOffsetMs;
  const endUtcMs = startUtcMs + 24 * 60 * 60 * 1000;

  return {
    startIso: new Date(startUtcMs).toISOString(),
    endIso: new Date(endUtcMs).toISOString(),
  };
}

function toGuardVisitor(visitor: Record<string, unknown>) {
  return {
    id: visitor.id,
    company_id: visitor.company_id,
    gate_id: visitor.gate_id,
    name: visitor.name || "Visitor",
    phone: decryptOrLegacy(visitor.phone_encrypted as string | null, visitor.phone as string | null),
    document_type: visitor.document_type,
    id_number: decryptOrLegacy(visitor.id_number_encrypted as string | null, visitor.id_number as string | null),
    vehicle_reg: decryptOrLegacy(visitor.vehicle_reg_encrypted as string | null, visitor.vehicle_reg as string | null),
    status: visitor.status,
    created_at: visitor.created_at,
    checked_in_at: visitor.checked_in_at,
    host_id: visitor.host_id,
    host_name: visitor.host_name,
    host_confirmed: visitor.host_confirmed,
    host_confirmed_at: visitor.host_confirmed_at,
    purpose: visitor.purpose,
    photo_url: visitor.photo_url,
    custom_data: visitor.custom_data || {},
    otp_code: visitor.otp_code,
    pass_token: visitor.pass_token,
    pass_code: visitor.pass_code,
    pass_expired_at: visitor.pass_expired_at,
    verification_method: visitor.verification_method,
  };
}

async function hydrateHostNames(
  supabaseAdmin: Awaited<ReturnType<typeof requireRole>>["supabaseAdmin"],
  visitors: Record<string, unknown>[]
) {
  const missingHostIds = Array.from(new Set(
    visitors
      .filter((visitor) => visitor.host_id && !visitor.host_name)
      .map((visitor) => String(visitor.host_id))
  ));

  if (missingHostIds.length === 0) return visitors;

  const { data: hosts, error } = await supabaseAdmin
    .from("hosts")
    .select("id, name")
    .in("id", missingHostIds);

  if (error) {
    console.error("Guard visitor host-name hydration failed:", error);
    return visitors;
  }

  const hostNames = new Map((hosts || []).map((host) => [host.id, host.name]));
  return visitors.map((visitor) => ({
    ...visitor,
    host_name: visitor.host_name || hostNames.get(String(visitor.host_id)) || null,
  }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("id");
    const requestedCompanyId = searchParams.get("company_id");
    const auth = await requireRole(request, ["guard", "company_admin", "superadmin"]);

    const companyId = auth.profile.role === "superadmin"
      ? requestedCompanyId || auth.profile.company_id
      : auth.profile.company_id;

    if (!companyId) {
      return NextResponse.json({ error: "Company context is required." }, { status: 400 });
    }

    assertCompanyAccess(auth.profile, companyId);

    let guardGateId: string | null = null;
    if (auth.profile.role === "guard") {
      const { data: guardProfile, error: guardProfileError } = await auth.supabaseAdmin
        .from("profiles")
        .select("gate_id")
        .eq("id", auth.profile.id)
        .eq("company_id", companyId)
        .single();

      if (guardProfileError) throw guardProfileError;
      guardGateId = guardProfile?.gate_id || null;
    }

    const { startIso, endIso } = getKenyaDayRange();

    let query = auth.supabaseAdmin
      .from("visitors")
      .select(GUARD_VISITOR_SELECT)
      .eq("company_id", companyId)
      .in("status", ACTIVE_STATUSES)
      .or(`status.eq.checked_in,and(status.eq.pending,created_at.gte.${startIso},created_at.lt.${endIso})`)
      .order("created_at", { ascending: false })
      .limit(visitorId ? 1 : 500);

    if (visitorId) query = query.eq("id", visitorId);
    if (guardGateId) query = query.or(`gate_id.eq.${guardGateId},gate_id.is.null`);

    let statsQuery = auth.supabaseAdmin
      .from("visitors")
      .select("status, created_at")
      .eq("company_id", companyId)
      .or(`created_at.gte.${startIso},and(status.eq.checked_in,created_at.lt.${startIso})`)
      .lt("created_at", endIso);

    if (guardGateId) statsQuery = statsQuery.or(`gate_id.eq.${guardGateId},gate_id.is.null`);

    const [{ data, error }, { data: statsData, error: statsError }] = await Promise.all([query, statsQuery]);
    if (error) throw error;
    if (statsError) throw statsError;

    const stats = (statsData || []).reduce((counts, visitor) => {
      const createdAt = new Date(visitor.created_at).getTime();
      if (createdAt >= new Date(startIso).getTime() && createdAt < new Date(endIso).getTime()) {
        counts.totalToday += 1;
      }
      if (visitor.status === "pending") counts.pendingCount += 1;
      if (visitor.status === "checked_in") counts.checkedInCount += 1;
      if (visitor.status === "checked_out") counts.checkedOutCount += 1;
      return counts;
    }, { ...EMPTY_STATS });

    await writeAuditLog({
      supabaseAdmin: auth.supabaseAdmin,
      companyId,
      actor: auth.profile,
      action: "guard_viewed_sensitive_visitor_details",
      resourceType: visitorId ? "visitor" : "visitor_collection",
      resourceId: visitorId || null,
      metadata: { recordCount: data?.length || 0, activeOnly: true, includesOverdueCheckouts: true },
      dedupeWindowSeconds: visitorId ? 300 : 60,
    });

    const hydratedVisitors = await hydrateHostNames(auth.supabaseAdmin, (data || []) as unknown as Record<string, unknown>[]);
    return NextResponse.json({ data: hydratedVisitors.map(toGuardVisitor), stats });
  } catch (error) {
    console.error("Guard visitors fetch failed:", error);
    const safeError = getSafeErrorResponse(error, "Active visitors could not be loaded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
