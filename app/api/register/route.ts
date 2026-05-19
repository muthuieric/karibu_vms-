import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/password-policy";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizePlan } from "@/lib/billing/pricing";
import { optionalText, requireText } from "@/lib/validation";
import { getSafeErrorResponse } from "@/lib/api-auth";

// We MUST use the Service Role Key here to safely bypass RLS 
// and to be allowed to create Auth users on the backend.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(request: Request) {
  try {
    const rateLimited = checkRateLimit(request, { keyPrefix: "register", limit: 5, windowMs: 60_000 });
    if (rateLimited) return rateLimited;

    // NEW: Capture the planTier from the request
    const { companyName, address, fullName, email, phone, password, planTier } = await request.json();

    const safeCompanyName = requireText(companyName, "Company name", 160);
    const safeFullName = requireText(fullName, "Full name", 120);
    const safeEmail = requireText(email, "Email", 160).toLowerCase();
    const requestedPlan = normalizePlan(planTier);
    const safePlanTier = requestedPlan === "premium" ? "premium" : "basic";

    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: PASSWORD_REQUIREMENTS_MESSAGE }, { status: 400 });
    }

    // 1. Create the Company (Locked & Pending, saving all contact info and Plan Tier)
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert([{
        name: safeCompanyName,
        address: optionalText(address, 240),
        contact_name: safeFullName,
        contact_email: safeEmail,
        contact_phone: optionalText(phone, 40),
        plan_tier: safePlanTier,
        is_locked: true, 
        subscription_status: "pending_approval", 
        amount_paid: 0
      }])
      .select()
      .single();

    if (companyError) throw companyError;

    // 2. Create the Admin User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: safeEmail,
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
        full_name: safeFullName,
        role: "company_admin" 
      }]);

    if (profileError) {
      throw profileError;
    }

    return NextResponse.json({ success: true, companyId: company.id });

  } catch (error: unknown) {
    console.error("Registration Error:", error);
    const safeError = getSafeErrorResponse(error, "Registration could not be completed.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
