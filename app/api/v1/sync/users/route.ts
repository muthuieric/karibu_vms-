import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/security/api-key-auth";
import { getSafeErrorResponse } from "@/lib/api-auth";
import { DEFAULT_HOST_PASSWORD, generateTemporaryPassword } from "@/lib/password-policy";

type UserInput = {
  name: string;
  phone?: string;
  email?: string;
  external_id: string;
  group_external_id?: string;
  department_id?: string;
};

function normalizeUserInputs(body: any): UserInput[] {
  if (Array.isArray(body)) {
    return body;
  }
  if (Array.isArray(body?.users)) {
    return body.users;
  }
  if (body && typeof body === "object" && body.name && body.external_id) {
    return [body];
  }
  return [];
}

async function tryProvisionHostAuth(
  supabaseAdmin: any,
  companyId: string,
  hostId: string,
  name: string,
  email?: string | null
) {
  const cleanEmail = email?.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) return;

  try {
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: DEFAULT_HOST_PASSWORD,
      email_confirm: true,
      user_metadata: {
        role: "host",
        companyId,
        hostId,
        name,
        must_change_password: true,
      },
    });

    if (authData?.user) {
      await supabaseAdmin
        .from("hosts")
        .update({ user_id: authData.user.id })
        .eq("id", hostId);

      await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: authData.user.id,
            company_id: companyId,
            role: "host",
            full_name: name,
            email: cleanEmail,
            must_change_password: true,
          },
          { onConflict: "id" }
        );
    }
  } catch (err) {
    // Non-blocking for directory sync
    console.warn("Background auth provisioning for synced user:", err);
  }
}

/**
 * POST /api/v1/sync/users
 * Idempotently creates or updates hosts/tenants mapped to their unit/department.
 * Supports batch payloads up to 500 records.
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticateApiKey(request);
    const body = await request.json().catch(() => null);
    const userInputs = normalizeUserInputs(body);

    if (userInputs.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid payload. Provide a user { name, external_id, group_external_id } or batch { users: [...] }.",
        },
        { status: 400 }
      );
    }

    if (userInputs.length > 500) {
      return NextResponse.json(
        { error: "Batch size exceeds limit of 500 users per request." },
        { status: 400 }
      );
    }

    // Cache group external_id -> department_id to avoid repeated DB lookups
    const groupCache = new Map<string, string>();

    let createdCount = 0;
    let updatedCount = 0;
    const results: Array<{
      id: string;
      name: string;
      external_id: string;
      department_id: string;
      action: "created" | "updated";
    }> = [];
    const errors: Array<{ external_id: string; error: string }> = [];

    for (const item of userInputs) {
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const externalId = typeof item.external_id === "string" ? item.external_id.trim() : "";
      const phone = typeof item.phone === "string" ? item.phone.trim() : null;
      const email = typeof item.email === "string" ? item.email.trim().toLowerCase() : null;
      const groupExternalId = typeof item.group_external_id === "string" ? item.group_external_id.trim() : "";
      let targetDeptId = typeof item.department_id === "string" ? item.department_id.trim() : "";

      if (!name || !externalId) {
        errors.push({
          external_id: externalId || "unknown",
          error: "Both 'name' and 'external_id' are required.",
        });
        continue;
      }

      // Resolve department_id from group_external_id if provided
      if (groupExternalId) {
        if (groupCache.has(groupExternalId)) {
          targetDeptId = groupCache.get(groupExternalId)!;
        } else {
          const { data: dept } = await auth.supabaseAdmin
            .from("departments")
            .select("id")
            .eq("company_id", auth.companyId)
            .eq("external_id", groupExternalId)
            .maybeSingle();

          if (dept) {
            targetDeptId = dept.id;
            groupCache.set(groupExternalId, dept.id);
          } else {
            errors.push({
              external_id: externalId,
              error: `No group found matching group_external_id '${groupExternalId}'. Sync the group first.`,
            });
            continue;
          }
        }
      }

      // Check if user already exists
      const { data: existingHost } = await auth.supabaseAdmin
        .from("hosts")
        .select("id, name, phone, email, department_id, user_id")
        .eq("company_id", auth.companyId)
        .eq("external_id", externalId)
        .maybeSingle();

      if (existingHost) {
        const effectiveDeptId = targetDeptId || existingHost.department_id;
        const updateData: Record<string, any> = {
          name,
          phone: phone ?? existingHost.phone,
          email: email ?? existingHost.email,
          department_id: effectiveDeptId,
        };

        const { error: updateErr } = await auth.supabaseAdmin
          .from("hosts")
          .update(updateData)
          .eq("id", existingHost.id);

        if (updateErr) {
          errors.push({ external_id: externalId, error: updateErr.message });
          continue;
        }

        // Check if auth provisioning is needed
        if (email && !existingHost.user_id) {
          void tryProvisionHostAuth(auth.supabaseAdmin, auth.companyId, existingHost.id, name, email);
        }

        updatedCount++;
        results.push({
          id: existingHost.id,
          name,
          external_id: externalId,
          department_id: effectiveDeptId,
          action: "updated",
        });
      } else {
        // Needs a department_id to insert
        if (!targetDeptId) {
          errors.push({
            external_id: externalId,
            error: "A valid 'group_external_id' or 'department_id' is required to create a new record.",
          });
          continue;
        }

        const { data: newHost, error: insertErr } = await auth.supabaseAdmin
          .from("hosts")
          .insert([
            {
              company_id: auth.companyId,
              department_id: targetDeptId,
              name,
              phone,
              email,
              external_id: externalId,
            },
          ])
          .select("id, name, external_id, department_id")
          .single();

        if (insertErr) {
          errors.push({ external_id: externalId, error: insertErr.message });
          continue;
        }

        if (email) {
          void tryProvisionHostAuth(auth.supabaseAdmin, auth.companyId, newHost.id, name, email);
        }

        createdCount++;
        results.push({
          id: newHost.id,
          name: newHost.name,
          external_id: externalId,
          department_id: targetDeptId,
          action: "created",
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: userInputs.length,
        created: createdCount,
        updated: updatedCount,
        failed: errors.length,
      },
      data: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Sync users error:", error);
    const safeError = getSafeErrorResponse(error, "Failed to sync directory users.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

/**
 * GET /api/v1/sync/users
 * Lists synced users for the authenticated company.
 */
export async function GET(request: Request) {
  try {
    const auth = await authenticateApiKey(request);

    const { data, error } = await auth.supabaseAdmin
      .from("hosts")
      .select(`
        id,
        name,
        phone,
        email,
        external_id,
        created_at,
        departments:department_id (
          id,
          name,
          external_id
        )
      `)
      .eq("company_id", auth.companyId)
      .order("name", { ascending: true });

    if (error) throw error;

    const formatted = (data || []).map((h: any) => ({
      id: h.id,
      name: h.name,
      phone: h.phone,
      email: h.email,
      external_id: h.external_id,
      group_name: h.departments?.name || null,
      group_external_id: h.departments?.external_id || null,
      department_id: h.departments?.id || null,
      created_at: h.created_at,
    }));

    return NextResponse.json({
      success: true,
      user_label: auth.userLabel,
      group_label: auth.groupLabel,
      data: formatted,
    });
  } catch (error) {
    console.error("List sync users error:", error);
    const safeError = getSafeErrorResponse(error, "Failed to fetch directory users.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

/**
 * DELETE /api/v1/sync/users
 * Deletes a user by external_id.
 */
export async function DELETE(request: Request) {
  try {
    const auth = await authenticateApiKey(request);
    const { searchParams } = new URL(request.url);
    const externalId = searchParams.get("external_id")?.trim();

    if (!externalId) {
      return NextResponse.json({ error: "Missing required query parameter: 'external_id'" }, { status: 400 });
    }

    const { data: host, error: findErr } = await auth.supabaseAdmin
      .from("hosts")
      .select("id, name")
      .eq("company_id", auth.companyId)
      .eq("external_id", externalId)
      .maybeSingle();

    if (findErr) throw findErr;
    if (!host) {
      return NextResponse.json({ error: `User with external_id '${externalId}' not found.` }, { status: 404 });
    }

    const { error: deleteErr } = await auth.supabaseAdmin
      .from("hosts")
      .delete()
      .eq("id", host.id);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({
      success: true,
      message: `User '${host.name}' (external_id: ${externalId}) deleted successfully.`,
      deleted_external_id: externalId,
    });
  } catch (error) {
    console.error("Delete sync user error:", error);
    const safeError = getSafeErrorResponse(error, "Failed to delete directory user.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

