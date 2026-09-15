import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/security/api-key-auth";
import { getSafeErrorResponse } from "@/lib/api-auth";

type GroupInput = {
  name: string;
  external_id: string;
};

function normalizeGroupInputs(body: any): GroupInput[] {
  if (Array.isArray(body)) {
    return body;
  }
  if (Array.isArray(body?.groups)) {
    return body.groups;
  }
  if (body && typeof body === "object" && body.name && body.external_id) {
    return [body];
  }
  return [];
}

/**
 * POST /api/v1/sync/groups
 * Idempotently creates or updates groups/departments by external_id.
 * Supports single item or batch array payloads.
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticateApiKey(request);
    const body = await request.json().catch(() => null);
    const groupInputs = normalizeGroupInputs(body);

    if (groupInputs.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid payload. Provide a group { name, external_id } or batch { groups: [{ name, external_id }] }.",
        },
        { status: 400 }
      );
    }

    if (groupInputs.length > 500) {
      return NextResponse.json(
        { error: "Batch size exceeds limit of 500 groups per request." },
        { status: 400 }
      );
    }

    let createdCount = 0;
    let updatedCount = 0;
    const results: Array<{ id: string; name: string; external_id: string; action: "created" | "updated" }> = [];
    const errors: Array<{ external_id: string; error: string }> = [];

    for (const item of groupInputs) {
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const externalId = typeof item.external_id === "string" ? item.external_id.trim() : "";

      if (!name || !externalId) {
        errors.push({
          external_id: externalId || "unknown",
          error: "Both 'name' and 'external_id' are required and must be non-empty strings.",
        });
        continue;
      }

      // Check if department with this external_id already exists for this company
      const { data: existingDept } = await auth.supabaseAdmin
        .from("departments")
        .select("id, name, external_id")
        .eq("company_id", auth.companyId)
        .eq("external_id", externalId)
        .maybeSingle();

      if (existingDept) {
        if (existingDept.name !== name) {
          const { error: updateErr } = await auth.supabaseAdmin
            .from("departments")
            .update({ name })
            .eq("id", existingDept.id);

          if (updateErr) {
            errors.push({ external_id: externalId, error: updateErr.message });
            continue;
          }
        }
        updatedCount++;
        results.push({ id: existingDept.id, name, external_id: externalId, action: "updated" });
      } else {
        const { data: newDept, error: insertErr } = await auth.supabaseAdmin
          .from("departments")
          .insert([{ company_id: auth.companyId, name, external_id: externalId }])
          .select("id, name, external_id")
          .single();

        if (insertErr) {
          errors.push({ external_id: externalId, error: insertErr.message });
          continue;
        }

        createdCount++;
        results.push({ id: newDept.id, name: newDept.name, external_id: externalId, action: "created" });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: groupInputs.length,
        created: createdCount,
        updated: updatedCount,
        failed: errors.length,
      },
      data: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Sync groups error:", error);
    const safeError = getSafeErrorResponse(error, "Failed to sync directory groups.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

/**
 * GET /api/v1/sync/groups
 * Lists all synced groups for the authenticated company.
 */
export async function GET(request: Request) {
  try {
    const auth = await authenticateApiKey(request);

    const { data, error } = await auth.supabaseAdmin
      .from("departments")
      .select("id, name, external_id, created_at")
      .eq("company_id", auth.companyId)
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      group_label: auth.groupLabel,
      data: data || [],
    });
  } catch (error) {
    console.error("List sync groups error:", error);
    const safeError = getSafeErrorResponse(error, "Failed to fetch directory groups.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

/**
 * DELETE /api/v1/sync/groups
 * Deletes a group by external_id.
 */
export async function DELETE(request: Request) {
  try {
    const auth = await authenticateApiKey(request);
    const { searchParams } = new URL(request.url);
    const externalId = searchParams.get("external_id")?.trim();

    if (!externalId) {
      return NextResponse.json({ error: "Missing required query parameter: 'external_id'" }, { status: 400 });
    }

    const { data: dept, error: findErr } = await auth.supabaseAdmin
      .from("departments")
      .select("id, name")
      .eq("company_id", auth.companyId)
      .eq("external_id", externalId)
      .maybeSingle();

    if (findErr) throw findErr;
    if (!dept) {
      return NextResponse.json({ error: `Group with external_id '${externalId}' not found.` }, { status: 404 });
    }

    const { error: deleteErr } = await auth.supabaseAdmin
      .from("departments")
      .delete()
      .eq("id", dept.id);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({
      success: true,
      message: `Group '${dept.name}' (external_id: ${externalId}) deleted successfully.`,
      deleted_external_id: externalId,
    });
  } catch (error) {
    console.error("Delete sync group error:", error);
    const safeError = getSafeErrorResponse(error, "Failed to delete directory group.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

