import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { assertResourceCompanyAccess } from "@/lib/api-resources";
import { optionalText, requireText, requireUuid } from "@/lib/validation";
import { generateTemporaryPassword } from "@/lib/password-policy";
import { DEFAULT_HOST_PASSWORD } from "@/lib/password-policy";

type AuthProvisionResult = {
  status: "created" | "already_exists" | "skipped" | "failed";
  email?: string;
  temporaryPassword?: string;
  defaultPassword?: string;
  userId?: string;
  message?: string;
};

async function provisionHostAuthUser(
  supabaseAdmin: Awaited<ReturnType<typeof requireRole>>["supabaseAdmin"],
  {
    hostId,
    companyId,
    hostName,
    email,
  }: {
    hostId: string;
    companyId: string;
    hostName: string;
    email?: string | null;
  }
): Promise<AuthProvisionResult> {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    return { status: "skipped", message: "No email address provided for host" };
  }

  const temporaryPassword = generateTemporaryPassword(14);
  const defaultPassword = DEFAULT_HOST_PASSWORD;

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        role: "host",
        companyId,
        hostId,
        name: hostName,
        must_change_password: true,
      },
    });

    if (authError) {
      const isAlreadyRegistered =
        authError.message?.toLowerCase().includes("already registered") ||
        authError.message?.toLowerCase().includes("already been registered") ||
        authError.status === 422;

      if (isAlreadyRegistered) {
        return {
          status: "already_exists",
          email: normalizedEmail,
          message: "Auth user already exists for this email.",
        };
      }

      console.warn("Host auth provisioning failed:", authError);
      return {
        status: "failed",
        email: normalizedEmail,
        message: authError.message,
      };
    }

    if (authData?.user) {
      // Link user_id in hosts table
      await supabaseAdmin
        .from("hosts")
        .update({ user_id: authData.user.id })
        .eq("id", hostId);

      // Create/upsert user profile with role: 'host'
      const { error: profileErr } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: authData.user.id,
          company_id: companyId,
          role: "host",
          full_name: hostName,
          email: normalizedEmail,
          must_change_password: true,
        }, { onConflict: "id" });

      if (profileErr) {
        console.warn("Host profile creation warning:", profileErr.message);
        // Fallback without must_change_password in case column isn't migrated yet
        try {
          await supabaseAdmin
            .from("profiles")
            .upsert({
              id: authData.user.id,
              company_id: companyId,
              role: "host",
              full_name: hostName,
              email: normalizedEmail,
            }, { onConflict: "id" });
        } catch (fallbackErr) {
          console.warn("Fallback upsert also failed:", fallbackErr);
        }
      }

      return {
        status: "created",
        email: normalizedEmail,
        temporaryPassword: defaultPassword,
        defaultPassword,
        userId: authData.user.id,
        message: "Host auth account created successfully with default password.",
      };
    }

    return { status: "failed", email: normalizedEmail, message: "No user returned from auth service" };
  } catch (err) {
    console.error("Host auth provisioning exception:", err);
    return {
      status: "failed",
      email: normalizedEmail,
      message: err instanceof Error ? err.message : "Failed to provision host auth account",
    };
  }
}

async function assertDepartmentBelongsToCompany(supabaseAdmin: Awaited<ReturnType<typeof requireRole>>["supabaseAdmin"], departmentId: string, companyId: string) {
  const { data, error } = await supabaseAdmin
    .from("departments")
    .select("id")
    .eq("id", departmentId)
    .eq("company_id", companyId)
    .single();

  if (error || !data) {
    throw Object.assign(new Error("Invalid department."), { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const { company_id, department_id, name, phone, email } = await request.json();
    const companyId = requireUuid(company_id, "company_id");
    const departmentId = requireUuid(department_id, "department_id");
    const hostName = requireText(name, "Host name", 120);
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    assertCompanyAccess(profile, companyId);
    await assertDepartmentBelongsToCompany(supabaseAdmin, departmentId, companyId);

    const cleanEmail = optionalText(email, 160);

    const { data, error } = await supabaseAdmin
      .from("hosts")
      .insert([{ company_id: companyId, department_id: departmentId, name: hostName, phone: optionalText(phone, 30), email: cleanEmail }])
      .select("id, company_id, department_id, name, phone, email, created_at")
      .single();

    if (error) throw error;

    const authAccount = await provisionHostAuthUser(supabaseAdmin, {
      hostId: data.id,
      companyId,
      hostName,
      email: cleanEmail,
    });

    return NextResponse.json({ data, authAccount });
  } catch (error) {
    console.error("Host create error:", error);
    const safeError = getSafeErrorResponse(error, "Host could not be created.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = requireUuid(searchParams.get("company_id"), "company_id");
    const authHeader = request.headers.get("authorization");

    let supabaseAdmin;
    let selectFields = "id, department_id, name";
    if (authHeader) {
      const auth = await requireRole(request, ["company_admin", "guard", "superadmin"]);
      supabaseAdmin = auth.supabaseAdmin;
      assertCompanyAccess(auth.profile, companyId);
      if (auth.profile.role === "company_admin" || auth.profile.role === "superadmin") {
        selectFields = "id, company_id, department_id, name, phone, email, created_at";
      }
    } else {
      const { createSupabaseAdmin } = await import("@/lib/billing/server");
      supabaseAdmin = createSupabaseAdmin();
    }

    const { data, error } = await supabaseAdmin
      .from("hosts")
      .select(selectFields)
      .eq("company_id", companyId)
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Host list error:", error);
    const safeError = getSafeErrorResponse(error, "Hosts could not be loaded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, phone, email } = await request.json();
    const hostId = requireUuid(id, "hostId");
    const hostName = requireText(name, "Host name", 120);
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    await assertResourceCompanyAccess(supabaseAdmin, profile, "hosts", hostId);

    const cleanEmail = optionalText(email, 160);

    const { data, error } = await supabaseAdmin
      .from("hosts")
      .update({ name: hostName, phone: optionalText(phone, 30), email: cleanEmail })
      .eq("id", hostId)
      .select("id, company_id, department_id, name, phone, email, created_at, user_id")
      .single();

    if (error) throw error;

    let authAccount: AuthProvisionResult | null = null;
    if (cleanEmail && !data.user_id) {
      authAccount = await provisionHostAuthUser(supabaseAdmin, {
        hostId: data.id,
        companyId: data.company_id,
        hostName,
        email: cleanEmail,
      });
    }

    return NextResponse.json({ data, authAccount });
  } catch (error) {
    console.error("Host update error:", error);
    const safeError = getSafeErrorResponse(error, "Host could not be updated.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = requireUuid(searchParams.get("id"), "hostId");
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    await assertResourceCompanyAccess(supabaseAdmin, profile, "hosts", hostId);

    const { error } = await supabaseAdmin.from("hosts").delete().eq("id", hostId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Host delete error:", error);
    const safeError = getSafeErrorResponse(error, "Host could not be deleted.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
