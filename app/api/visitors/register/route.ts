import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseErrorMessage } from "@/lib/supabase-error";
import { checkRateLimit } from "@/lib/rate-limit";
import { optionalText, requireText, requireUuid } from "@/lib/validation";
import { createVisitorPassToken, getVisitorPassUrl } from "@/lib/visitor-pass";
import { isQrPassBackendEnabledForPlan, resolveVisitorVerificationMethod } from "@/lib/visitor-verification";
import { encryptValue, getActiveHashKeyId, getLast4, hmacValue, hmacValuesForAllKeys, normalizeIdentifier, normalizePhone } from "@/lib/crypto-fields";
import { incrementBillingUsage } from "@/lib/billing/usage";
import { writeAuditLog } from "@/lib/audit-log";

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
  name?: string;
  phone?: string;
  document_type?: string | null;
  id_number?: string | null;
  vehicle_reg?: string | null;
  status: string;
  created_at?: string;
  host_id?: string | null;
  host_name?: string | null;
  purpose?: string | null;
  photo_url?: string | null;
  custom_data?: Record<string, string>;
  pass_token?: string | null;
};

type CompanyRegistrationSettings = {
  id: string;
  is_locked: boolean | null;
  plan_tier?: string | null;
  visitor_verification_method?: string | null;
  ask_phone?: boolean | null;
  ask_id?: boolean | null;
  ask_host?: boolean | null;
  ask_purpose?: boolean | null;
  ask_vehicle?: boolean | null;
};

function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === "42703" || candidate.code === "PGRST204" || /column .* does not exist|Could not find .* column/i.test(candidate.message || "");
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function maskLast4(last4?: string | null) {
  return last4 ? `••••${last4}` : "";
}

function encryptedFieldSet(value: string | null, normalizer: (value: string) => string) {
  if (!value) {
    return { encrypted: null, hash: null, last4: null, normalized: "" };
  }

  const normalized = normalizer(value);
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

function getIdentifierMatchLabel(matches: Array<"phone" | "id_number" | "vehicle_reg">) {
  if (matches.length > 1) return "multiple";
  return matches[0] || "identifier_not_available";
}

function inFilter(column: string, values: string[]) {
  return values.length > 0 ? `${column}.in.(${values.join(",")})` : null;
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

    const phoneFields = encryptedFieldSet(optionalText(payload.phone, 40), normalizePhone);
    const idNumberFields = encryptedFieldSet(optionalText(payload.id_number, 60), normalizeIdentifier);
    const vehicleRegFields = encryptedFieldSet(optionalText(payload.vehicle_reg, 60), normalizeIdentifier);

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    let companyResult = await supabaseAdmin
      .from("companies")
        .select("id, is_locked, plan_tier, visitor_verification_method, ask_phone, ask_id, ask_host, ask_purpose, ask_vehicle")
      .eq("id", companyId)
      .single();

    if (isMissingColumnError(companyResult.error)) {
      companyResult = await supabaseAdmin
        .from("companies")
        .select("id, is_locked, plan_tier, ask_phone, ask_id, ask_host, ask_purpose, ask_vehicle")
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

    const companySettings = company as CompanyRegistrationSettings;
    const phoneEnabled = companySettings.ask_phone !== false;
    const idNumberEnabled = companySettings.ask_id !== false;
    const hostEnabled = companySettings.ask_host === true;
    const purposeEnabled = companySettings.ask_purpose === true;
    const vehicleRegEnabled = companySettings.ask_vehicle === true;

    const safePhoneFields = phoneEnabled ? phoneFields : { encrypted: null, hash: null, last4: null, normalized: "" };
    const safeIdNumberFields = idNumberEnabled ? idNumberFields : { encrypted: null, hash: null, last4: null, normalized: "" };
    const safeVehicleRegFields = vehicleRegEnabled ? vehicleRegFields : { encrypted: null, hash: null, last4: null, normalized: "" };
    const activeHashKeyId = getActiveHashKeyId();

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
    if (hostEnabled && payload.host_id) {
      const { data: host } = await supabaseAdmin
        .from("hosts")
        .select("id, name")
        .eq("id", payload.host_id)
        .eq("company_id", companyId)
        .maybeSingle();

      safeHostId = host?.id ?? null;
      safeHostName = host?.name ?? null;
    }

    const now = new Date();
    const phoneHashes = safePhoneFields.normalized ? hmacValuesForAllKeys(safePhoneFields.normalized) : [];
    const idNumberHashes = safeIdNumberFields.normalized ? hmacValuesForAllKeys(safeIdNumberFields.normalized) : [];
    const vehicleRegHashes = safeVehicleRegFields.normalized ? hmacValuesForAllKeys(safeVehicleRegFields.normalized) : [];
    const redFlagFilters = [
      inFilter("phone_hash", phoneHashes),
      inFilter("id_number_hash", idNumberHashes),
      inFilter("vehicle_reg_hash", vehicleRegHashes),
    ].filter(Boolean);

    if (redFlagFilters.length > 0) {
      const redFlagQuery = supabaseAdmin
        .from("red_flags")
        .select("id, phone_hash, id_number_hash, vehicle_reg_hash")
        .eq("company_id", companyId)
        .eq("status", "active")
        .or(`expires_at.is.null,expires_at.gt.${now.toISOString()}`)
        .or(redFlagFilters.join(","))
        .limit(20);

      const { data: restrictedVisitors, error: redFlagError } = await redFlagQuery;

      if (redFlagError) {
        console.error("Restricted visitor check failed:", redFlagError);
        return NextResponse.json({ error: "Visitor registration could not be verified." }, { status: 500 });
      }

      if (restrictedVisitors?.length) {
        const matchedIdentifiers: Array<"phone" | "id_number" | "vehicle_reg"> = [];
        if (phoneHashes.length && restrictedVisitors.some((flag) => phoneHashes.includes(flag.phone_hash || ""))) {
          matchedIdentifiers.push("phone");
        }
        if (idNumberHashes.length && restrictedVisitors.some((flag) => idNumberHashes.includes(flag.id_number_hash || ""))) {
          matchedIdentifiers.push("id_number");
        }
        if (vehicleRegHashes.length && restrictedVisitors.some((flag) => vehicleRegHashes.includes(flag.vehicle_reg_hash || ""))) {
          matchedIdentifiers.push("vehicle_reg");
        }

        await writeAuditLog({
          supabaseAdmin,
          companyId,
          action: "restricted_visitor_match",
          resourceType: "red_flag",
          resourceId: restrictedVisitors[0]?.id || null,
          metadata: {
            matched_identifier: getIdentifierMatchLabel(matchedIdentifiers),
            matchedRedFlagIds: restrictedVisitors.map((flag) => flag.id),
            gateId: safeGateId,
          },
        });

        return NextResponse.json({ error: "Visitor registration cannot be completed at this entrance." }, { status: 403 });
      }
    } else {
      await writeAuditLog({
        supabaseAdmin,
        companyId,
        action: "restricted_visitor_match_skipped",
        resourceType: "visitor_registration",
        metadata: {
          matched_identifier: "identifier_not_available",
          gateId: safeGateId,
          reason: "no_phone_id_or_vehicle_identifier_provided",
        },
      });
    }

    const verificationMethod = resolveVisitorVerificationMethod(company.plan_tier, company.visitor_verification_method);
    const qrPassEnabled = verificationMethod === "qr_pass" && isQrPassBackendEnabledForPlan(company.plan_tier);

    if (verificationMethod === "qr_pass" && !qrPassEnabled) {
      return NextResponse.json(
        { error: "QR Pass is selected but not enabled in environment settings." },
        { status: 503 }
      );
    }

    const retentionDays = 180;
    const deleteAfter = addDays(now, retentionDays).toISOString();

    const insertPayload = {
      company_id: companyId,
      name: visitorName,
      phone: null,
      phone_encrypted: safePhoneFields.encrypted,
      phone_hash: safePhoneFields.hash,
      phone_last4: safePhoneFields.last4,
      document_type: payload.document_type || null,
      id_number: null,
      id_number_encrypted: safeIdNumberFields.encrypted,
      id_number_hash: safeIdNumberFields.hash,
      id_number_last4: safeIdNumberFields.last4,
      host_id: safeHostId,
      host_name: safeHostName,
      purpose: purposeEnabled ? payload.purpose || null : null,
      vehicle_reg: null,
      vehicle_reg_encrypted: safeVehicleRegFields.encrypted,
      vehicle_reg_hash: safeVehicleRegFields.hash,
      vehicle_reg_last4: safeVehicleRegFields.last4,
      hash_key_id: activeHashKeyId,
      status: "pending",
      photo_url: payload.photo_url || null,
      custom_data: { ...(payload.custom_data || {}), source: payload.custom_data?.source || "public_qr" },
      gate_id: safeGateId,
      verification_method: verificationMethod === "basic_default" ? null : verificationMethod,
      retention_days: retentionDays,
      delete_after: deleteAfter,
    };

    const insertPayloadWithQrPass = qrPassEnabled
      ? { ...insertPayload, pass_token: createVisitorPassToken() }
      : insertPayload;

    const visitorSelect: string = qrPassEnabled
      ? "id, company_id, gate_id, name, document_type, host_id, host_name, purpose, status, created_at, photo_url, custom_data, phone_last4, id_number_last4, vehicle_reg_last4, pass_token, pass_code, pass_expired_at, verification_method"
      : "id, company_id, gate_id, name, document_type, host_id, host_name, purpose, status, created_at, photo_url, custom_data, phone_last4, id_number_last4, vehicle_reg_last4, pass_code, pass_expired_at, verification_method";

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

    try {
      await incrementBillingUsage(supabaseAdmin, companyId, now);
    } catch (billingError) {
      console.error("Billing usage increment failed:", billingError);
    }

    return NextResponse.json({
      data: {
        ...data,
        phone: maskLast4((insertedVisitor as { phone_last4?: string | null }).phone_last4),
        id_number: maskLast4((insertedVisitor as { id_number_last4?: string | null }).id_number_last4),
        vehicle_reg: maskLast4((insertedVisitor as { vehicle_reg_last4?: string | null }).vehicle_reg_last4),
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
