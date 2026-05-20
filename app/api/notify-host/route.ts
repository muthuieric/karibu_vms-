import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseAdmin } from "@/lib/billing/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireUuid } from "@/lib/validation";

function escapeHtml(value: unknown) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getAppOrigin(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) return new URL(configuredUrl).origin;
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const rateLimitResponse = checkRateLimit(request, { keyPrefix: "notify-host" });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { visitorId, companyId } = await request.json();
    const safeVisitorId = requireUuid(visitorId, "visitorId");
    const safeCompanyId = requireUuid(companyId, "companyId");
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL;

    if (!resendApiKey || !resendFromEmail) {
      console.error("Host notification email is not configured.");
      return NextResponse.json({ error: "Host notification email is not configured." }, { status: 500 });
    }

    const supabaseAdmin = createSupabaseAdmin();
    const { data: visitor, error: visitorError } = await supabaseAdmin
      .from("visitors")
      .select("id, company_id, name, phone, purpose, photo_url, host_id")
      .eq("id", safeVisitorId)
      .eq("company_id", safeCompanyId)
      .single();

    if (visitorError || !visitor?.host_id) {
      return NextResponse.json({ error: "Visitor host could not be found." }, { status: 404 });
    }

    const [{ data: host, error: hostError }, { data: company, error: companyError }] = await Promise.all([
      supabaseAdmin
        .from("hosts")
        .select("id, company_id, name, email")
        .eq("id", visitor.host_id)
        .eq("company_id", safeCompanyId)
        .single(),
      supabaseAdmin
        .from("companies")
        .select("id, name")
        .eq("id", safeCompanyId)
        .single(),
    ]);

    if (hostError || !host?.email || companyError || !company) {
      return NextResponse.json({ error: "Host notification details could not be found." }, { status: 404 });
    }

    const origin = getAppOrigin(request);
    const confirmLink = `${origin}/${safeCompanyId}/host-confirm`;
    const visitorPhoto = visitor.photo_url
      ? `<img src="${escapeHtml(visitor.photo_url)}" alt="Visitor photo" style="width: 88px; height: 88px; border-radius: 999px; object-fit: cover; border: 3px solid #ffffff; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.16); display: block;" />`
      : `<div style="width: 88px; height: 88px; border-radius: 999px; background: #e0f2fe; border: 3px solid #ffffff; color: #0369a1; font-size: 13px; font-weight: 800; line-height: 88px; text-align: center; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);">No photo</div>`;

    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: resendFromEmail,
      to: [host.email],
      subject: `Arrival Alert: ${visitor.name} is here to see you`,
      html: `
        <div style="margin: 0; padding: 0; background: #f1f5f9; font-family: Arial, Helvetica, sans-serif; color: #0f172a;">
          <div style="width: 100%; background: #f1f5f9; padding: 32px 14px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="background: #ffffff; border: 1px solid #dbe4ef; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.10);">
                <div style="background: #0f172a; padding: 26px 28px;">
                  <p style="margin: 0 0 10px 0; color: #93c5fd; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">Karibu VMS</p>
                  <h1 style="margin: 0; color: #ffffff; font-size: 26px; line-height: 1.25; font-weight: 800;">Visitor awaiting confirmation</h1>
                  <p style="margin: 12px 0 0 0; color: #cbd5e1; font-size: 15px; line-height: 1.6;">Hello ${escapeHtml(host.name)}, a visitor is waiting at the security gate for <strong style="color: #ffffff;">${escapeHtml(company.name)}</strong>.</p>
                </div>

                <div style="padding: 30px 28px 28px 28px;">
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; margin: 0 0 24px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                      <tr>
                        <td style="width: 108px; vertical-align: top; padding: 0 20px 0 0;">
                          ${visitorPhoto}
                        </td>
                        <td style="vertical-align: top; padding: 0;">
                          <p style="margin: 0 0 6px 0; color: #64748b; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;">Visitor details</p>
                          <h2 style="margin: 0; color: #0f172a; font-size: 22px; line-height: 1.3; font-weight: 800;">${escapeHtml(visitor.name)}</h2>
                          <p style="margin: 8px 0 0 0; color: #475569; font-size: 14px; line-height: 1.6;">Please review the information below before confirming their visit.</p>
                        </td>
                      </tr>
                    </table>

                    <div style="height: 1px; background: #e2e8f0; margin: 22px 0;"></div>

                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                      <tr>
                        <td style="padding: 0 0 14px 0; color: #64748b; font-size: 13px; line-height: 1.5; width: 130px;">Visitor name</td>
                        <td style="padding: 0 0 14px 0; color: #0f172a; font-size: 15px; line-height: 1.5; font-weight: 700;">${escapeHtml(visitor.name)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 14px 0; color: #64748b; font-size: 13px; line-height: 1.5; width: 130px;">Phone</td>
                        <td style="padding: 0 0 14px 0; color: #0f172a; font-size: 15px; line-height: 1.5; font-weight: 700;">${escapeHtml(visitor.phone || "Not provided")}</td>
                      </tr>
                      <tr>
                        <td style="padding: 0; color: #64748b; font-size: 13px; line-height: 1.5; width: 130px;">Purpose</td>
                        <td style="padding: 0; color: #0f172a; font-size: 15px; line-height: 1.5; font-weight: 700;">${escapeHtml(visitor.purpose || "Not stated")}</td>
                      </tr>
                    </table>
                  </div>

                  <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 18px 20px; margin: 0 0 24px 0;">
                    <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.7;">When the visitor arrives, please ask them for the <strong>OTP code</strong> they received at the gate, then confirm their visit in Karibu VMS.</p>
                  </div>

                  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 0 auto 18px auto;">
                    <tr>
                      <td style="background: #2563eb; border-radius: 12px; box-shadow: 0 12px 24px rgba(37, 99, 235, 0.24);">
                        <a href="${confirmLink}" style="display: inline-block; padding: 15px 26px; color: #ffffff; font-size: 16px; line-height: 1.2; font-weight: 800; text-decoration: none; border-radius: 12px;">Confirm visitor</a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 26px 0; text-align: center; color: #64748b; font-size: 12px; line-height: 1.6;">Button not working? Open this secure confirmation link:<br /><a href="${confirmLink}" style="color: #2563eb; font-weight: 700; text-decoration: none; word-break: break-all;">${confirmLink}</a></p>

                  <div style="border-top: 1px solid #e2e8f0; padding-top: 18px;">
                    <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.7;">If you are not expecting this visitor, please contact security before sharing any confirmation code.</p>
                  </div>
                </div>
              </div>

              <p style="margin: 18px 0 0 0; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">Karibu VMS visitor management notification</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend host notification failed:", {
        visitorId: safeVisitorId,
        companyId: safeCompanyId,
        error,
      });
      return NextResponse.json({ error: "Failed to send notification email." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Host notification failed:", error);
    return NextResponse.json({ error: "Failed to send notification email." }, { status: 500 });
  }
}
