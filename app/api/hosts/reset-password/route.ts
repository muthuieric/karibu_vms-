import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { assertResourceCompanyAccess } from "@/lib/api-resources";
import { requireUuid } from "@/lib/validation";
import { DEFAULT_HOST_PASSWORD } from "@/lib/password-policy";

export async function POST(request: Request) {
  try {
    const { hostId, companyId } = await request.json();
    const safeHostId = requireUuid(hostId, "hostId");
    const safeCompanyId = requireUuid(companyId, "companyId");

    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    assertCompanyAccess(profile, safeCompanyId);
    await assertResourceCompanyAccess(supabaseAdmin, profile, "hosts", safeHostId);

    const { data: host, error: hostError } = await supabaseAdmin
      .from("hosts")
      .select("id, name, email, user_id, company_id")
      .eq("id", safeHostId)
      .eq("company_id", safeCompanyId)
      .single();

    if (hostError || !host) {
      return NextResponse.json({ error: "Host not found." }, { status: 404 });
    }

    if (!host.email) {
      return NextResponse.json({ error: "Host does not have an email address." }, { status: 400 });
    }

    // If host has no user_id, provision them now
    if (!host.user_id) {
      const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: host.email.trim().toLowerCase(),
        password: DEFAULT_HOST_PASSWORD,
        email_confirm: true,
        user_metadata: {
          role: "host",
          companyId: safeCompanyId,
          hostId: host.id,
          name: host.name,
          must_change_password: true,
        },
      });

      if (createError) {
        // If already registered in auth, look them up
        const isAlreadyRegistered = createError.message?.toLowerCase().includes("already registered");
        if (isAlreadyRegistered) {
          // List users or update by email
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
          const found = existingUsers?.users?.find((u) => u.email?.toLowerCase() === host.email?.toLowerCase());
          if (found) {
            await supabaseAdmin.from("hosts").update({ user_id: found.id }).eq("id", host.id);
            await supabaseAdmin.auth.admin.updateUserById(found.id, {
              password: DEFAULT_HOST_PASSWORD,
              user_metadata: {
                ...found.user_metadata,
                role: "host",
                companyId: safeCompanyId,
                hostId: host.id,
                must_change_password: true,
              },
            });
            await supabaseAdmin.from("profiles").upsert({
              id: found.id,
              company_id: safeCompanyId,
              role: "host",
              full_name: host.name,
              email: host.email,
              must_change_password: true,
            }, { onConflict: "id" });

            return NextResponse.json({
              success: true,
              defaultPassword: DEFAULT_HOST_PASSWORD,
              message: `Password reset to ${DEFAULT_HOST_PASSWORD}. Host must change password on login.`,
            });
          }
        }
        throw createError;
      }

      if (createdUser?.user) {
        await supabaseAdmin.from("hosts").update({ user_id: createdUser.user.id }).eq("id", host.id);
        await supabaseAdmin.from("profiles").upsert({
          id: createdUser.user.id,
          company_id: safeCompanyId,
          role: "host",
          full_name: host.name,
          email: host.email,
          must_change_password: true,
        }, { onConflict: "id" });
      }
    } else {
      // Existing auth user - update password and flag must_change_password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(host.user_id, {
        password: DEFAULT_HOST_PASSWORD,
        user_metadata: {
          role: "host",
          companyId: safeCompanyId,
          hostId: host.id,
          must_change_password: true,
        },
      });

      if (updateError) throw updateError;

      await supabaseAdmin.from("profiles").upsert({
        id: host.user_id,
        company_id: safeCompanyId,
        role: "host",
        full_name: host.name,
        email: host.email,
        must_change_password: true,
      }, { onConflict: "id" });
    }

    return NextResponse.json({
      success: true,
      defaultPassword: DEFAULT_HOST_PASSWORD,
      message: `Password for ${host.name} reset to ${DEFAULT_HOST_PASSWORD}. Host will be prompted to change password upon login.`,
    });
  } catch (error) {
    console.error("Host reset password error:", error);
    const safeError = getSafeErrorResponse(error, "Could not reset host password.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

