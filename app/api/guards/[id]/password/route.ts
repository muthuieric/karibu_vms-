import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/password-policy";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdminCaller(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return { error: "Missing Authorization header", status: 401 };

  const token = authHeader.replace("Bearer ", "");
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
  if (authError || !user) return { error: "Invalid token", status: 401 };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  const validAdminRoles = ["company_admin", "company-admin", "super_admin", "superadmin"];

  if (!profile || !validAdminRoles.includes(profile.role)) {
    return { error: "Forbidden: You do not have admin privileges", status: 403 };
  }

  return { user, profile };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: guardId } = await context.params;
    const { password } = await request.json();

    if (!guardId) {
      return NextResponse.json({ error: "Guard ID is required" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "New password is required" }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: PASSWORD_REQUIREMENTS_MESSAGE }, { status: 400 });
    }

    const authCheck = await verifyAdminCaller(request);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    const adminProfile = authCheck.profile;
    if (!adminProfile) {
      return NextResponse.json({ error: "Forbidden: You do not have admin privileges" }, { status: 403 });
    }

    const { data: guardProfile } = await supabaseAdmin
      .from("profiles")
      .select("company_id, role")
      .eq("id", guardId)
      .single();

    if (!guardProfile || guardProfile.role !== "guard") {
      return NextResponse.json({ error: "Guard not found" }, { status: 404 });
    }

    const adminRole = adminProfile.role;
    const isSuperAdmin = ["super_admin", "superadmin"].includes(adminRole);
    if (!isSuperAdmin && adminProfile.company_id !== guardProfile.company_id) {
      return NextResponse.json({ error: "You can only update guards in your workspace." }, { status: 403 });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(guardId, {
      password,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message || "Supabase update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update guard password";
    console.error("Guard Password Update Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
