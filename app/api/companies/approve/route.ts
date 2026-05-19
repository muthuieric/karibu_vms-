import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { requireUuid } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { supabaseAdmin } = await requireRole(request, ["superadmin"]);
    const resend = new Resend(process.env.RESEND_API_KEY!);

    const { companyId } = await request.json();
    const safeCompanyId = requireUuid(companyId, "companyId");

    // 1. Get the company details so we know who to email (Now querying plan_tier too)
    const { data: company, error: fetchError } = await supabaseAdmin
      .from("companies")
      .select("name, contact_email, contact_name, plan_tier")
      .eq("id", safeCompanyId)
      .single();

    if (fetchError || !company) throw new Error("Company not found");

    // 2. Calculate Trial Expiry (30 days from now)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    // 3. Update the Database
    const { error: updateError } = await supabaseAdmin
      .from("companies")
      .update({ 
        subscription_status: 'trial', 
        is_locked: false, 
        subscription_ends_at: expiryDate.toISOString() 
      })
      .eq("id", safeCompanyId);

    if (updateError) throw updateError;

    // 4. Send the Approval Email via Resend
    if (company.contact_email) {
      await resend.emails.send({
        from: "VMS Portal <onboarding@resend.dev>", 
        to: company.contact_email,
        subject: "Your VMS Account is Approved! 🎉",
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #111827;">Welcome to VMS Portal, ${company.contact_name || 'Admin'}!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Great news! Your workspace for <strong>${company.name}</strong> has been fully approved by our administration team. You are enrolled in the <strong>${(company.plan_tier || 'basic').toUpperCase()} Plan</strong>.</p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; margin: 24px 0;">
                <p style="margin: 0; color: #166534; font-weight: bold;">Your 1-Month Free Trial begins immediately and is active until ${expiryDate.toLocaleDateString()}.</p>
            </div>

            <br/>
            <a href="https://karibu-vms.vercel.app/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Log in to your Dashboard
            </a>
            <br/><br/>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">If you have any questions, our support team is here to help.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error("Approval Error:", error);
    const safeError = getSafeErrorResponse(error, "Company approval could not be completed.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
