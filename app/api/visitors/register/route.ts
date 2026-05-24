import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseErrorMessage } from "@/lib/supabase-error";
import { checkRateLimit } from "@/lib/rate-limit";
import { optionalText, requireText, requireUuid } from "@/lib/validation";
import { createVisitorPassToken, getVisitorPassUrl } from "@/lib/visitor-pass";
import { isQrPassBackendEnabledForPlan, resolveVisitorVerificationMethod } from "@/lib/visitor-verification";

type VisitorRegistrationPayload = {
  company_id?: string;
  gate_id?: string | null;
  name?: string;
  phone?: string | null;
  document_type?: string | null;
  id_number?: string | null;
  host_id?: string | null;
  host_name?: string | null;
  purpose?: string | null;
  vehicle_reg?: string | null;
  photo_url?: string | null;
  custom_data?: Record<string, string>;
};

type VisitorRegistrationResponse = {
  id: string;
  company_id: string;
  gate_id: string | null;
  status: string;
  pass_token?: string | null;
};

function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === "42703" || candidate.code === "PGRST204" || /column .* does not exist|Could not find .* column/i.test(candidate.message || "");
}

export async function POST(request: Request) {
  try {
    const rateLimited = checkRateLimit(request, { keyPrefix: "visitor-register", limit: 10, windowMs: 60_000 });
    if (rateLimited) return rateLimited;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const payload = (await request.json()) as VisitorRegistrationPayload;
    const companyId = requireUuid(payload.company_id, "company_id");
    const visitorName = requireText(payload.name, "Visitor name", 120);

    const normalizedPhone = optionalText(payload.phone, 40) || "";
    const normalizedIdNumber = optionalText(payload.id_number, 60);

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    let companyResult = await supabaseAdmin
      .from("companies")
      .select("id, is_locked, plan_tier, visitor_verification_method")
      .eq("id", companyId)
      .single();

    if (isMissingColumnError(companyResult.error)) {
      companyResult = await supabaseAdmin
        .from("companies")
        .select("id, is_locked, plan_tier")
        .eq("id", companyId)
        .single();
    }

    const { data: company, error: companyError } = companyResult;

    if (companyError || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (company.is_locked) {
      return NextResponse.json({ error: "Company check-in is unavailable" }, { status: 403 });
    }

    let safeGateId: string | null = null;
    if (payload.gate_id) {
      const { data: gate } = await supabaseAdmin
        .from("gates")
        .select("id")
        .eq("id", payload.gate_id)
        .eq("company_id", companyId)
        .maybeSingle();

      safeGateId = gate?.id ?? null;
    }

    let safeHostId: string | null = null;
    let safeHostName: string | null = null;
    if (payload.host_id) {
      const { data: host } = await supabaseAdmin
        .from("hosts")
        .select("id, name")
        .eq("id", payload.host_id)
        .eq("company_id", companyId)
        .maybeSingle();

      safeHostId = host?.id ?? null;
      safeHostName = host?.name ?? null;
    }

    const { data: restrictedVisitors, error: redFlagError } = await supabaseAdmin
      .from("red_flags")
      .select("name, id_number, phone, reason")
      .eq("company_id", companyId);

    if (redFlagError) {
      console.error("Restricted visitor check failed:", redFlagError);
      return NextResponse.json({ error: "Visitor registration could not be verified." }, { status: 500 });
    }

    const visitorNameLower = visitorName.toLowerCase();
    const isRestricted = (restrictedVisitors || []).find((flag) => {
      const matchId = normalizedIdNumber && flag.id_number && String(flag.id_number).trim() === normalizedIdNumber;
      const matchPhone = normalizedPhone && flag.phone && String(flag.phone).trim() === normalizedPhone;
      const matchName = flag.name && String(flag.name).trim().toLowerCase() === visitorNameLower;

      if (matchId || matchPhone) return true;
      if (!matchName) return false;

      const differentId = normalizedIdNumber && flag.id_number && String(flag.id_number).trim() !== normalizedIdNumber;
      const differentPhone = normalizedPhone && flag.phone && String(flag.phone).trim() !== normalizedPhone;
      return !(differentId || differentPhone);
    });

    if (isRestricted) {
      return NextResponse.json({ error: "Visitor registration cannot be completed at this entrance." }, { status: 403 });
    }

    const verificationMethod = resolveVisitorVerificationMethod(company.plan_tier, company.visitor_verification_method);
    const qrPassEnabled = verificationMethod === "qr_pass" && isQrPassBackendEnabledForPlan(company.plan_tier);

    if (verificationMethod === "qr_pass" && !qrPassEnabled) {
      return NextResponse.json(
        { error: "QR Pass is selected but not enabled in environment settings." },
        { status: 503 }
      );
    }

    const insertPayload = {
      company_id: companyId,
      name: visitorName,
      phone: normalizedPhone,
      document_type: payload.document_type || null,
      id_number: normalizedIdNumber,
      host_id: safeHostId,
      host_name: safeHostName,
      purpose: payload.purpose || null,
      vehicle_reg: payload.vehicle_reg || null,
      status: "pending",
      photo_url: payload.photo_url || null,
      custom_data: { ...(payload.custom_data || {}), source: "public_qr" },
      gate_id: safeGateId,
      verification_method: verificationMethod === "basic_default" ? null : verificationMethod,
    };

    const insertPayloadWithQrPass = qrPassEnabled
      ? { ...insertPayload, pass_token: createVisitorPassToken() }
      : insertPayload;

    const visitorSelect: string = qrPassEnabled
      ? "id, company_id, gate_id, status, pass_token"
      : "id, company_id, gate_id, status";

    const { data: insertedVisitor, error } = await supabaseAdmin
      .from("visitors")
      .insert([insertPayloadWithQrPass])
      .select(visitorSelect)
      .single();

    if (error) {
      console.error("Public visitor insert failed:", {
        error,
        companyId,
        gateId: safeGateId,
        hostId: safeHostId,
      });
      return NextResponse.json({ error: getSupabaseErrorMessage(error, "Failed to register visitor") }, { status: 400 });
    }

    const data = insertedVisitor as unknown as VisitorRegistrationResponse;

    return NextResponse.json({
      data: {
        ...data,
        passToken: qrPassEnabled ? data.pass_token : null,
        passUrl: qrPassEnabled && data.pass_token ? getVisitorPassUrl(data.pass_token) : null,
        qrPassEnabled,
        verificationMethod,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Public visitor registration failed:", error);
    return NextResponse.json({ error: getSupabaseErrorMessage(error, "Failed to register visitor") }, { status: 500 });
  }
}
