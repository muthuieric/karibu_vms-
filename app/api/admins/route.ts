import { NextResponse } from "next/server";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/password-policy";
import { getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { requireUuid } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { email, password, fullName, companyId } = await request.json();
    const safeCompanyId = requireUuid(companyId, "companyId");
    const { supabaseAdmin } = await requireRole(request, ["superadmin"]);

    if (!email || !password || !fullName || !companyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: PASSWORD_REQUIREMENTS_MESSAGE }, { status: 400 });
    }

    // 1. Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // 2. Link them to the specific company with the 'company_admin' role!
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        company_id: safeCompanyId,
        role: "company_admin",
        full_name: fullName,
        email,
      });

    if (profileError) {
      // Rollback if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return NextResponse.json({ success: true, message: "Company Admin account created successfully." });

  } catch (error: unknown) {
    console.error("Admin Creation Error:", error);
    const safeError = getSafeErrorResponse(error, "Admin account could not be created.");
    return NextResponse.json(
      { error: safeError.message },
      { status: safeError.status }
    );
  }
}
