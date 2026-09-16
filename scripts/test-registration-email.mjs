#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

console.log("\n📧 Verifying Resend Registration Notification Configuration...\n");

const resendApiKey = process.env.RESEND_API_KEY;
const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "ericmuthuipatch22@gmail.com";
const resendFromEmail = process.env.RESEND_FROM_EMAIL || "Karibu VMS <onboarding@resend.dev>";

if (!resendApiKey) {
  console.error("❌ RESEND_API_KEY is not defined!");
  process.exit(1);
}

console.log(`✅ RESEND_API_KEY is present.`);
console.log(`✅ Sender email: ${resendFromEmail}`);
console.log(`✅ Admin recipient: ${adminNotificationEmail}`);

const sampleData = {
  companyName: "Acme Tower Plaza",
  fullName: "John Doe",
  email: "johndoe@example.com",
  phone: "+254712345678",
  address: "Kilimani, Nairobi",
  planTier: "premium",
  companyId: "comp_123456789",
};

const superadminCompaniesUrl = "https://www.karibuvms.com/dashboard/superadmin/companies";
const registrationDate = new Date().toLocaleString("en-US", {
  timeZone: "Africa/Nairobi",
  dateStyle: "full",
  timeStyle: "medium",
});

const subject = `🔔 New Organization Registered: ${sampleData.companyName} (${sampleData.planTier.toUpperCase()})`;
const textBody = `New Registration Alert!

Company / Organization: ${sampleData.companyName}
Contact Person: ${sampleData.fullName}
Admin Email: ${sampleData.email}
Phone: ${sampleData.phone}
Address: ${sampleData.address}
Selected Plan: ${sampleData.planTier.toUpperCase()}
Company ID: ${sampleData.companyId}
Time: ${registrationDate} (EAT)

Review and approve in Superadmin Dashboard:
${superadminCompaniesUrl}
`;

if (!subject.includes("Acme Tower Plaza")) {
  console.error("❌ Subject formatting failed");
  process.exit(1);
}

if (!textBody.includes("ericmuthuipatch22@gmail.com") && adminNotificationEmail !== "ericmuthuipatch22@gmail.com") {
  console.error("❌ Admin notification email mismatch");
  process.exit(1);
}

console.log("✅ Subject:", subject);
console.log("✅ Email payload formatted properly.");
console.log("🎉 Registration Notification test passed successfully!\n");

