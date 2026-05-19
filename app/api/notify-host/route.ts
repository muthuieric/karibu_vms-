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
      ? `<img src="${escapeHtml(visitor.photo_url)}" alt="Visitor photo" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; border: 2px solid #e4e4e7; display: block;" />`
      : "";

    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: resendFromEmail,
      to: [host.email],
      subject: `Arrival Alert: ${visitor.name} is here to see you`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px;">
          <h2 style="color: #000; margin-top: 0;">Hello ${escapeHtml(host.name)},</h2>
          <p>You have a visitor waiting at the security gate for <strong>${escapeHtml(company.name)}</strong>.</p>

          <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            ${visitorPhoto}
            <p style="margin: 0 0 10px 0;"><strong>Visitor Name:</strong> ${escapeHtml(visitor.name)}</p>
            <p style="margin: 0 0 10px 0;"><strong>Phone Number:</strong> ${escapeHtml(visitor.phone || "Not provided")}</p>
            <p style="margin: 0 0 10px 0;"><strong>Stated Purpose:</strong> ${escapeHtml(visitor.purpose || "Not stated")}</p>
          </div>

          <div style="margin: 30px 0;">
            <p style="font-size: 14px; color: #52525b; margin-bottom: 10px;">When the visitor arrives, please ask them for the <strong>OTP code</strong> they received at the gate.</p>
            <p style="font-size: 14px; color: #52525b; margin-bottom: 5px;">Click the link below to enter their code and confirm their visit:</p>
            <a href="${confirmLink}" style="color: #2563eb; font-weight: bold; font-size: 16px; word-break: break-all;">${confirmLink}</a>
          </div>

          <p style="font-size: 12px; color: #71717a; margin-bottom: 0;">If you are not expecting this visitor, please contact security.</p>
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
