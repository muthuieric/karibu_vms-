import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/password-policy";

// We MUST use the Service Role Key here to safely bypass RLS 
// and to be allowed to create Auth users on the backend.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(request: Request) {
  try {
    // NEW: Capture the planTier from the request
    const { companyName, address, fullName, email, phone, password, planTier } = await request.json();

    if (!companyName || !fullName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: PASSWORD_REQUIREMENTS_MESSAGE }, { status: 400 });
    }

    // 1. Create the Company (Locked & Pending, saving all contact info and Plan Tier)
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert([{
        name: companyName,
        address: address,         
        contact_name: fullName,   
        contact_email: email,     
        contact_phone: phone,     
        plan_tier: planTier || "basic", // NEW: Saving the selected plan (defaults to basic)
        is_locked: true, 
        subscription_status: "pending_approval", 
        amount_paid: 0
      }])
      .select()
      .single();

    if (companyError) throw companyError;

    // 2. Create the Admin User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, 
    });

    if (authError) {
      await supabaseAdmin.from("companies").delete().eq("id", company.id);
      throw authError;
    }

    // 3. Create the Profile linking the User to the new Company
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([{
        id: authData.user.id,
        company_id: company.id,
        full_name: fullName,
        role: "company_admin" 
      }]);

    if (profileError) {
      throw profileError;
    }

    return NextResponse.json({ success: true, companyId: company.id });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    console.error("Registration Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
