import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { requireText, requireUuid } from "@/lib/validation";
import { generateApiKey } from "@/lib/security/api-key-auth";

/**
 * GET /api/company-admin/api-keys
 * Lists all API keys generated for the company.
 */
export async function GET(request: Request) {
  try {
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    const { searchParams } = new URL(request.url);
    const companyIdParam = searchParams.get("company_id") || profile.company_id;
    const companyId = requireUuid(companyIdParam, "company_id");

    assertCompanyAccess(profile, companyId);

    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("id, name, key_prefix, is_active, last_used_at, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("List API keys error:", error);
    const safeError = getSafeErrorResponse(error, "Failed to load API keys.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

/**
 * POST /api/company-admin/api-keys
 * Generates a new cryptographically secure API key for the company.
 * Returns the plaintext raw key once for the user to copy.
 */
export async function POST(request: Request) {
  try {
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    const body = await request.json().catch(() => ({}));
    const companyIdParam = body.company_id || profile.company_id;
    const companyId = requireUuid(companyIdParam, "company_id");
    const keyName = requireText(body.name || "PMS Integration", "API Key Name", 80);

    assertCompanyAccess(profile, companyId);

    const { rawKey, keyPrefix, keyHash } = generateApiKey("kvms_live");

    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .insert([
        {
          company_id: companyId,
          name: keyName,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          is_active: true,
        },
      ])
      .select("id, name, key_prefix, is_active, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({
      data: {
        ...data,
        raw_key: rawKey,
      },
    });
  } catch (error) {
    console.error("Create API key error:", error);
    const safeError = getSafeErrorResponse(error, "Failed to generate API key.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

/**
 * DELETE /api/company-admin/api-keys
 * Revokes / deletes an API key.
 */
export async function DELETE(request: Request) {
  try {
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    const { searchParams } = new URL(request.url);
    const keyId = requireUuid(searchParams.get("id"), "API Key ID");

    // Ensure key belongs to user's company
    const { data: keyRecord, error: keyErr } = await supabaseAdmin
      .from("api_keys")
      .select("id, company_id")
      .eq("id", keyId)
      .single();

    if (keyErr || !keyRecord) {
      return NextResponse.json({ error: "API key not found." }, { status: 404 });
    }

    assertCompanyAccess(profile, keyRecord.company_id);

    const { error: deleteErr } = await supabaseAdmin
      .from("api_keys")
      .delete()
      .eq("id", keyId);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({ success: true, message: "API key revoked successfully." });
  } catch (error) {
    console.error("Revoke API key error:", error);
    const safeError = getSafeErrorResponse(error, "Failed to revoke API key.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

