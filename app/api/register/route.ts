import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/password-policy";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizePlan } from "@/lib/billing/pricing";
import { optionalText, requireText } from "@/lib/validation";
import { getSafeErrorResponse } from "@/lib/api-auth";
import { getAppUrl } from "@/lib/app-url";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

    // NEW: Capture the planTier and optional logo data from the request
    const {
      companyName,
      address,
      fullName,
      email,
      phone,
      password,
      planTier,
      logoBase64,
      logoExt,
      logoMimeType,
    } = await request.json();

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

    // Handle optional logo upload
    if (logoBase64 && typeof logoBase64 === "string") {
      try {
        const cleanExt = (logoExt || "png").replace(/[^a-z0-9]/gi, "").toLowerCase() || "png";
        const buffer = Buffer.from(logoBase64, "base64");
        const storagePath = `logos/${company.id}/logo.${cleanExt}`;
        const contentType = logoMimeType || (cleanExt === "svg" ? "image/svg+xml" : `image/${cleanExt === "jpg" ? "jpeg" : cleanExt}`);

        const { error: uploadError } = await supabaseAdmin.storage
          .from("company-assets")
          .upload(storagePath, buffer, {
            contentType,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from("company-assets")
            .getPublicUrl(storagePath);

          await supabaseAdmin
            .from("companies")
            .update({ logo_url: publicUrlData.publicUrl })
            .eq("id", company.id);
        } else {
          console.error("Failed to upload company logo during registration:", uploadError);
        }
      } catch (logoErr) {
        console.error("Error processing company logo during registration:", logoErr);
      }
    }

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

    // 4. Send notification email to admin via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "ericmuthuipatch22@gmail.com";
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || "Karibu VMS <onboarding@resend.dev>";

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const appUrl = getAppUrl();
        const superadminCompaniesUrl = `${appUrl}/dashboard/superadmin/companies`;

        const registrationDate = new Date().toLocaleString("en-US", {
          timeZone: "Africa/Nairobi",
          dateStyle: "full",
          timeStyle: "medium",
        });

        await resend.emails.send({
          from: resendFromEmail,
          to: [adminNotificationEmail],
          subject: `🔔 New Organization Registered: ${safeCompanyName} (${safePlanTier.toUpperCase()})`,
          text: `New Registration Alert!

Company / Organization: ${safeCompanyName}
Contact Person: ${safeFullName}
Admin Email: ${safeEmail}
Phone: ${phone || "Not provided"}
Address: ${address || "Not provided"}
Selected Plan: ${safePlanTier.toUpperCase()}
Company ID: ${company.id}
Time: ${registrationDate} (EAT)

Review and approve in Superadmin Dashboard:
${superadminCompaniesUrl}
`,
          html: `
            <div style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
              <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 32px 28px; text-align: left;">
                  <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 12px;">
                    Karibu VMS Alert
                  </span>
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; line-height: 1.25;">
                    New Organization Registered! 🚀
                  </h1>
                  <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px; line-height: 1.5;">
                    A new workspace account has been requested and is awaiting review in the Superadmin portal.
                  </p>
                </div>

                <div style="padding: 28px;">
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                      <tr>
                        <td style="padding: 9px 0; color: #64748b; font-weight: 600; width: 140px; border-bottom: 1px solid #f1f5f9;">Organization:</td>
                        <td style="padding: 9px 0; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9;">${escapeHtml(safeCompanyName)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Contact Name:</td>
                        <td style="padding: 9px 0; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9;">${escapeHtml(safeFullName)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Admin Email:</td>
                        <td style="padding: 9px 0; font-weight: 600; border-bottom: 1px solid #f1f5f9;">
                          <a href="mailto:${escapeHtml(safeEmail)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(safeEmail)}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Phone:</td>
                        <td style="padding: 9px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${phone ? escapeHtml(phone) : '<span style="color: #94a3b8;">Not provided</span>'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Location / Address:</td>
                        <td style="padding: 9px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${address ? escapeHtml(address) : '<span style="color: #94a3b8;">Not provided</span>'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Selected Plan:</td>
                        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9;">
                          <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; text-transform: uppercase;">
                            ${escapeHtml(safePlanTier)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Initial Status:</td>
                        <td style="padding: 9px 0; border-bottom: 1px solid #f1f5f9;">
                          <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;">
                            Pending Approval
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Time:</td>
                        <td style="padding: 9px 0; color: #475569; font-size: 13px;">${escapeHtml(registrationDate)} (EAT)</td>
                      </tr>
                    </table>
                  </div>

                  <div style="text-align: center; margin: 30px 0 16px 0;">
                    <a href="${superadminCompaniesUrl}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
                      Open Superadmin Directory →
                    </a>
                  </div>

                  <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                      Company ID: <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 11px;">${company.id}</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("[Register] Failed to send admin registration notification email:", emailErr);
      }
    } else {
      console.warn("[Register] RESEND_API_KEY is not configured; skipping admin registration notification email.");
    }

    return NextResponse.json({ success: true, companyId: company.id });

  } catch (error: unknown) {
    console.error("Registration Error:", error);
    const safeError = getSafeErrorResponse(error, "Registration could not be completed.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
