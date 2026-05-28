import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { assertResourceCompanyAccess } from "@/lib/api-resources";
import { optionalText, requireText, requireUuid } from "@/lib/validation";
import { decryptValue, encryptValue, getLast4, hmacValue, normalizeIdentifier, normalizePhone } from "@/lib/crypto-fields";
import { writeAuditLog } from "@/lib/audit-log";

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function maskLast4(last4?: string | null) {
  return last4 ? `••••${last4}` : "";
}

export async function POST(request: Request) {
  try {
    const { company_id, name, id_number, phone, vehicle_reg, reason, reason_category, action } = await request.json();
    const companyId = requireUuid(company_id, "company_id");
    const visitorName = requireText(name, "Visitor name", 120);
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    assertCompanyAccess(profile, companyId);

    const normalizedPhone = normalizePhone(optionalText(phone, 40) || "");
    const normalizedIdNumber = normalizeIdentifier(optionalText(id_number, 60) || "");
    const normalizedVehicleReg = normalizeIdentifier(optionalText(vehicle_reg, 60) || "");
    if (!normalizedPhone && !normalizedIdNumber && !normalizedVehicleReg) {
      return NextResponse.json({ error: "Phone number, ID/passport number, or vehicle registration is required." }, { status: 400 });
    }

    const now = new Date();
    const reviewAt = addMonths(now, 12).toISOString();
    const expiresAt = addMonths(now, 24).toISOString();
    const safeReason = requireText(reason, "Restriction reason", 500);
    const phoneLast4 = normalizedPhone ? getLast4(normalizedPhone) : null;
    const idNumberLast4 = normalizedIdNumber ? getLast4(normalizedIdNumber) : null;
    const vehicleRegLast4 = normalizedVehicleReg ? getLast4(normalizedVehicleReg) : null;

    const { data, error } = await supabaseAdmin
      .from("red_flags")
      .insert([{
        company_id: companyId,
        name: "[encrypted]",
        name_encrypted: encryptValue(visitorName),
        id_number: null,
        id_number_encrypted: normalizedIdNumber ? encryptValue(normalizedIdNumber) : null,
        id_number_hash: normalizedIdNumber ? hmacValue(normalizedIdNumber) : null,
        id_number_last4: idNumberLast4,
        phone: null,
        phone_encrypted: normalizedPhone ? encryptValue(normalizedPhone) : null,
        phone_hash: normalizedPhone ? hmacValue(normalizedPhone) : null,
        phone_last4: phoneLast4,
        vehicle_reg_encrypted: normalizedVehicleReg ? encryptValue(normalizedVehicleReg) : null,
        vehicle_reg_hash: normalizedVehicleReg ? hmacValue(normalizedVehicleReg) : null,
        vehicle_reg_last4: vehicleRegLast4,
        reason: safeReason,
        reason_category: optionalText(reason_category, 80),
        action: optionalText(action, 80) || "deny_entry",
        status: "active",
        review_at: reviewAt,
        expires_at: expiresAt,
      }])
      .select("id, company_id, name_encrypted, id_number_last4, phone_last4, vehicle_reg_last4, reason, reason_category, action, status, review_at, expires_at, created_at")
      .single();

    if (error) throw error;

    await writeAuditLog({
      supabaseAdmin,
      companyId,
      actor: profile,
      action: "admin_created_red_flag",
      resourceType: "red_flag",
      resourceId: data.id,
      metadata: { reasonCategory: data.reason_category, action: data.action, reviewAt, expiresAt },
    });

    return NextResponse.json({
      data: {
        ...data,
        name: decryptValue(data.name_encrypted) || visitorName,
        id_number: maskLast4(data.id_number_last4),
        phone: maskLast4(data.phone_last4),
        vehicle_reg: maskLast4(data.vehicle_reg_last4),
      },
    });
  } catch (error) {
    console.error("Red flag create error:", error);
    const safeError = getSafeErrorResponse(error, "Restricted visitor record could not be created.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = requireUuid(searchParams.get("company_id"), "company_id");
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    assertCompanyAccess(profile, companyId);

    const { data, error } = await supabaseAdmin
      .from("red_flags")
      .select("id, name, name_encrypted, id_number_last4, phone_last4, vehicle_reg_last4, reason, reason_category, action, status, review_at, expires_at, created_at")
      .eq("company_id", companyId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({
      data: (data || []).map((flag) => ({
        id: flag.id,
        name: decryptValue(flag.name_encrypted) || flag.name || "Restricted visitor",
        id_number: maskLast4(flag.id_number_last4),
        phone: maskLast4(flag.phone_last4),
        vehicle_reg: maskLast4(flag.vehicle_reg_last4),
        reason: flag.reason,
        reason_category: flag.reason_category,
        action: flag.action,
        status: flag.status,
        review_at: flag.review_at,
        expires_at: flag.expires_at,
        created_at: flag.created_at,
      })),
    });
  } catch (error) {
    console.error("Red flag list error:", error);
    const safeError = getSafeErrorResponse(error, "Restricted visitor records could not be loaded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const redFlagId = requireUuid(searchParams.get("id"), "redFlagId");
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    const companyId = await assertResourceCompanyAccess(supabaseAdmin, profile, "red_flags", redFlagId);

    const { error } = await supabaseAdmin.from("red_flags").delete().eq("id", redFlagId);
    if (error) throw error;

    await writeAuditLog({
      supabaseAdmin,
      companyId,
      actor: profile,
      action: "admin_expired_deleted_anonymised_data",
      resourceType: "red_flag",
      resourceId: redFlagId,
      metadata: { operation: "delete" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Red flag delete error:", error);
    const safeError = getSafeErrorResponse(error, "Restricted visitor record could not be deleted.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name, id_number, phone, vehicle_reg, reason, reason_category, action, status } = await request.json();
    const redFlagId = requireUuid(id, "redFlagId");
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    const companyId = await assertResourceCompanyAccess(supabaseAdmin, profile, "red_flags", redFlagId);
    const { data: existingFlag, error: existingFlagError } = await supabaseAdmin
      .from("red_flags")
      .select("phone_hash, id_number_hash, vehicle_reg_hash")
      .eq("id", redFlagId)
      .single();

    if (existingFlagError) throw existingFlagError;

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const visitorName = optionalText(name, 120);
    if (visitorName) {
      updatePayload.name = "[encrypted]";
      updatePayload.name_encrypted = encryptValue(visitorName);
    }

    if (phone !== undefined) {
      const normalizedPhone = normalizePhone(optionalText(phone, 40) || "");
      updatePayload.phone = null;
      updatePayload.phone_encrypted = normalizedPhone ? encryptValue(normalizedPhone) : null;
      updatePayload.phone_hash = normalizedPhone ? hmacValue(normalizedPhone) : null;
      updatePayload.phone_last4 = normalizedPhone ? getLast4(normalizedPhone) : null;
    }

    if (id_number !== undefined) {
      const normalizedIdNumber = normalizeIdentifier(optionalText(id_number, 60) || "");
      updatePayload.id_number = null;
      updatePayload.id_number_encrypted = normalizedIdNumber ? encryptValue(normalizedIdNumber) : null;
      updatePayload.id_number_hash = normalizedIdNumber ? hmacValue(normalizedIdNumber) : null;
      updatePayload.id_number_last4 = normalizedIdNumber ? getLast4(normalizedIdNumber) : null;
    }

    if (vehicle_reg !== undefined) {
      const normalizedVehicleReg = normalizeIdentifier(optionalText(vehicle_reg, 60) || "");
      updatePayload.vehicle_reg_encrypted = normalizedVehicleReg ? encryptValue(normalizedVehicleReg) : null;
      updatePayload.vehicle_reg_hash = normalizedVehicleReg ? hmacValue(normalizedVehicleReg) : null;
      updatePayload.vehicle_reg_last4 = normalizedVehicleReg ? getLast4(normalizedVehicleReg) : null;
    }

    if (reason !== undefined) updatePayload.reason = requireText(reason, "Restriction reason", 500);
    if (reason_category !== undefined) updatePayload.reason_category = optionalText(reason_category, 80);
    if (action !== undefined) updatePayload.action = optionalText(action, 80) || "deny_entry";
    if (status !== undefined) updatePayload.status = optionalText(status, 40) || "active";

    const nextPhoneHash = "phone_hash" in updatePayload ? updatePayload.phone_hash : existingFlag.phone_hash;
    const nextIdNumberHash = "id_number_hash" in updatePayload ? updatePayload.id_number_hash : existingFlag.id_number_hash;
    const nextVehicleRegHash = "vehicle_reg_hash" in updatePayload ? updatePayload.vehicle_reg_hash : existingFlag.vehicle_reg_hash;
    if (!nextPhoneHash && !nextIdNumberHash && !nextVehicleRegHash) {
      return NextResponse.json({ error: "Phone number, ID/passport number, or vehicle registration is required." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("red_flags")
      .update(updatePayload)
      .eq("id", redFlagId)
      .select("id, name, name_encrypted, id_number_last4, phone_last4, vehicle_reg_last4, reason, reason_category, action, status, review_at, expires_at, created_at")
      .single();

    if (error) throw error;

    await writeAuditLog({
      supabaseAdmin,
      companyId,
      actor: profile,
      action: "admin_updated_red_flag",
      resourceType: "red_flag",
      resourceId: redFlagId,
      metadata: { updatedFields: Object.keys(updatePayload).filter((key) => key !== "updated_at") },
    });

    return NextResponse.json({
      data: {
        ...data,
        name: decryptValue(data.name_encrypted) || data.name || "Restricted visitor",
        id_number: maskLast4(data.id_number_last4),
        phone: maskLast4(data.phone_last4),
        vehicle_reg: maskLast4(data.vehicle_reg_last4),
      },
    });
  } catch (error) {
    console.error("Red flag update error:", error);
    const safeError = getSafeErrorResponse(error, "Restricted visitor record could not be updated.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
