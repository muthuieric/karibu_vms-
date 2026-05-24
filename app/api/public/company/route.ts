import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveVisitorVerificationMethod } from "@/lib/visitor-verification";

export const dynamic = "force-dynamic";

const PUBLIC_COMPANY_FIELDS = [
  "id",
  "name",
  "is_locked",
  "subscription_ends_at",
  "require_photo",
  "ask_phone",
  "ask_id",
  "ask_host",
  "ask_purpose",
  "ask_vehicle",
  "custom_fields",
  "enable_geofence",
  "lat",
  "lng",
  "geofence_radius",
  "plan_tier",
  "visitor_verification_method",
].join(", ");

const PUBLIC_COMPANY_FIELDS_FALLBACK = PUBLIC_COMPANY_FIELDS
  .split(", ")
  .filter((field) => field !== "visitor_verification_method")
  .join(", ");

const PRIVATE_ACCESS_FIELDS = [
  "hard_locked",
  "current_balance",
  "subscription_status",
].join(", ");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PublicCompany = {
  id: string;
  name: string;
  is_locked: boolean | null;
  subscription_ends_at: string | null;
  require_photo: boolean | null;
  ask_phone: boolean | null;
  ask_id: boolean | null;
  ask_host: boolean | null;
  ask_purpose: boolean | null;
  ask_vehicle: boolean | null;
  custom_fields: unknown;
  enable_geofence: boolean | null;
  lat: number | null;
  lng: number | null;
  geofence_radius: number | null;
  plan_tier: string | null;
  visitor_verification_method: string | null;
  hard_locked?: boolean | null;
  current_balance?: number | null;
  subscription_status?: string | null;
};

function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === "42703" || candidate.code === "PGRST204" || /column .* does not exist|Could not find .* column/i.test(candidate.message || "");
}

function logPublicCompanyDenied(reason: string, companyId?: string | null, extra?: Record<string, unknown>) {
  console.warn("Public company lookup denied", {
    reason,
    company_id: companyId || null,
    ...extra,
  });
}

function publicCompanyPayload(company: PublicCompany) {
  return {
    id: company.id,
    name: company.name,
    is_locked: company.is_locked,
    subscription_ends_at: company.subscription_ends_at,
    require_photo: company.require_photo,
    ask_phone: company.ask_phone,
    ask_id: company.ask_id,
    ask_host: company.ask_host,
    ask_purpose: company.ask_purpose,
    ask_vehicle: company.ask_vehicle,
    custom_fields: company.custom_fields,
    enable_geofence: company.enable_geofence,
    lat: company.lat,
    lng: company.lng,
    geofence_radius: company.geofence_radius,
    plan_tier: company.plan_tier,
    visitor_verification_method: resolveVisitorVerificationMethod(company.plan_tier, company.visitor_verification_method),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId || !UUID_RE.test(companyId)) {
      logPublicCompanyDenied("invalid_company_id", companyId);
      return NextResponse.json(
        { error: "Missing or invalid company_id" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let companyResult = await supabaseAdmin
      .from("companies")
      .select(`${PUBLIC_COMPANY_FIELDS}, ${PRIVATE_ACCESS_FIELDS}`)
      .eq("id", companyId)
      .maybeSingle();

    if (isMissingColumnError(companyResult.error)) {
      console.warn("Public company lookup retrying without newer columns", {
        reason: "schema_column_missing",
        company_id: companyId,
        code: companyResult.error?.code,
      });
      companyResult = await supabaseAdmin
        .from("companies")
        .select(`${PUBLIC_COMPANY_FIELDS_FALLBACK}, ${PRIVATE_ACCESS_FIELDS}`)
        .eq("id", companyId)
        .maybeSingle();
    }

    const { data, error } = companyResult;
    const company = data as PublicCompany | null;

    if (error) {
      console.error("Public company lookup query failed:", {
        reason: "lookup_error",
        company_id: companyId,
        code: error.code,
        message: error.message,
      });
      return NextResponse.json(
        { error: "Failed to load company" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!company) {
      logPublicCompanyDenied("not_found", companyId);
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (company.hard_locked) {
      logPublicCompanyDenied("locked", companyId);
      return NextResponse.json(
        { error: "Company unavailable" },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (["inactive", "pending_approval"].includes(String(company.subscription_status || "").toLowerCase())) {
      logPublicCompanyDenied("inactive", companyId);
      return NextResponse.json(
        { error: "Company unavailable" },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (company.is_locked) {
      logPublicCompanyDenied("suspended", companyId);
      return NextResponse.json(
        { error: "Company unavailable" },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (company.subscription_ends_at && new Date(company.subscription_ends_at) < new Date()) {
      logPublicCompanyDenied("expired", companyId);
      return NextResponse.json(
        { error: "Company unavailable" },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (Number(company.current_balance || 0) > 0 && String(company.subscription_status || "").toLowerCase() === "unpaid") {
      console.warn("Public company lookup billing notice", {
        reason: "outstanding_balance",
        company_id: companyId,
      });
    }

    return NextResponse.json(
      { data: publicCompanyPayload(company) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    console.error("Public company lookup failed:", error);
    return NextResponse.json(
      { error: "Failed to load company" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
