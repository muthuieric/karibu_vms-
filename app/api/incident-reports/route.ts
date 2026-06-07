import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit-log";

const ALLOWED_TYPES = [
  "visitor_related",
  "gate_issue",
  "restricted_attempt",
  "suspicious_activity",
  "property_issue",
  "emergency",
  "other",
];

const ALLOWED_URGENCY = ["low", "normal", "high", "critical"];
const ALLOWED_STATUS = ["pending_review", "reviewed", "dismissed", "linked_to_restriction"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedCompanyId = searchParams.get("company_id");
    const status = searchParams.get("status");

    const auth = await requireRole(request, ["guard", "company_admin", "superadmin"]);

    const companyId =
      auth.profile.role === "superadmin"
        ? requestedCompanyId || auth.profile.company_id
        : auth.profile.company_id;

    if (!companyId) {
      return NextResponse.json({ error: "Company context is required." }, { status: 400 });
    }

    assertCompanyAccess(auth.profile, companyId);

    let query = auth.supabaseAdmin
      .from("incident_reports")
      .select(
        `
        id,
        company_id,
        visitor_id,
        gate_id,
        reported_by,
        reviewed_by,
        incident_type,
        urgency,
        description,
        action_taken,
        status,
        admin_notes,
        created_at,
        reviewed_at,
        visitors(name, phone, id_number),
        gates(name),
        reporter:profiles!incident_reports_reported_by_fkey(full_name, role),
        reviewer:profiles!incident_reports_reviewed_by_fkey(full_name, role)
        `
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(500);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (auth.profile.role === "guard") {
      query = query.eq("reported_by", auth.profile.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Incident reports fetch failed:", error);
    const safeError = getSafeErrorResponse(error, "Reports could not be loaded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const auth = await requireRole(request, ["guard", "company_admin", "superadmin"]);
    const companyId = auth.profile.company_id;

    if (!companyId) {
      return NextResponse.json({ error: "Company context is required." }, { status: 400 });
    }

    assertCompanyAccess(auth.profile, companyId);

    const incidentType = String(body.incident_type || "other");
    const urgency = String(body.urgency || "normal");
    const description = String(body.description || "").trim();
    const actionTaken = body.action_taken ? String(body.action_taken).trim() : null;

    if (!ALLOWED_TYPES.includes(incidentType)) {
      return NextResponse.json({ error: "Invalid report type." }, { status: 400 });
    }

    if (!ALLOWED_URGENCY.includes(urgency)) {
      return NextResponse.json({ error: "Invalid urgency level." }, { status: 400 });
    }

    if (description.length < 5) {
      return NextResponse.json({ error: "Please describe what happened." }, { status: 400 });
    }

    const { data, error } = await auth.supabaseAdmin
      .from("incident_reports")
      .insert({
        company_id: companyId,
        visitor_id: body.visitor_id || null,
        gate_id: body.gate_id || auth.profile.gate_id || null,
        reported_by: auth.profile.id,
        incident_type: incidentType,
        urgency,
        description,
        action_taken: actionTaken,
        status: "pending_review",
      })
      .select("id")
      .single();

    if (error) throw error;

    await writeAuditLog({
      supabaseAdmin: auth.supabaseAdmin,
      companyId,
      actor: auth.profile,
      action: "guard_report_created",
      resourceType: "incident_report",
      resourceId: data.id,
      metadata: {
        incidentType,
        urgency,
        visitorId: body.visitor_id || null,
        gateId: body.gate_id || auth.profile.gate_id || null,
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Incident report creation failed:", error);
    const safeError = getSafeErrorResponse(error, "Report could not be saved.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const auth = await requireRole(request, ["company_admin", "superadmin"]);
    const companyId = auth.profile.company_id;

    if (!companyId) {
      return NextResponse.json({ error: "Company context is required." }, { status: 400 });
    }

    assertCompanyAccess(auth.profile, companyId);

    const reportId = String(body.id || "");
    const status = String(body.status || "");
    const adminNotes = body.admin_notes ? String(body.admin_notes).trim() : null;

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required." }, { status: 400 });
    }

    if (!ALLOWED_STATUS.includes(status)) {
      return NextResponse.json({ error: "Invalid review status." }, { status: 400 });
    }

    const { data, error } = await auth.supabaseAdmin
      .from("incident_reports")
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: auth.profile.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId)
      .eq("company_id", companyId)
      .select("id")
      .single();

    if (error) throw error;

    await writeAuditLog({
      supabaseAdmin: auth.supabaseAdmin,
      companyId,
      actor: auth.profile,
      action: "incident_report_reviewed",
      resourceType: "incident_report",
      resourceId: reportId,
      metadata: { status },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Incident report review failed:", error);
    const safeError = getSafeErrorResponse(error, "Report could not be reviewed.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}