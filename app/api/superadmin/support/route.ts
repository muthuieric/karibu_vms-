import { NextResponse } from "next/server";

import { getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireUuid } from "@/lib/validation";

export const dynamic = "force-dynamic";

const SUPPORT_STATUSES = ["pending", "in_progress", "resolved"] as const;
type SupportStatus = (typeof SUPPORT_STATUSES)[number];

type SupportTicketRow = {
  id: string;
  company_id: string | null;
  created_by: string | null;
  subject: string;
  description: string;
  status: string | null;
  created_at: string | null;
};

type CompanyRow = {
  id: string;
  name: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

function normalizeStatus(status: unknown): SupportStatus | null {
  const value = String(status || "").trim().toLowerCase();
  return SUPPORT_STATUSES.includes(value as SupportStatus) ? (value as SupportStatus) : null;
}

function uniqueNonEmpty(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

async function hydrateTickets(supabaseAdmin: ReturnType<typeof import("@/lib/billing/server").createSupabaseAdmin>, tickets: SupportTicketRow[]) {
  const companyIds = uniqueNonEmpty(tickets.map((ticket) => ticket.company_id));
  const profileIds = uniqueNonEmpty(tickets.map((ticket) => ticket.created_by));

  const [companiesRes, profilesRes] = await Promise.all([
    companyIds.length
      ? supabaseAdmin.from("companies").select("id, name").in("id", companyIds)
      : Promise.resolve({ data: [] as CompanyRow[], error: null }),
    profileIds.length
      ? supabaseAdmin.from("profiles").select("id, full_name, email").in("id", profileIds)
      : Promise.resolve({ data: [] as ProfileRow[], error: null }),
  ]);

  if (companiesRes.error) throw companiesRes.error;
  if (profilesRes.error) throw profilesRes.error;

  const companiesById = new Map((companiesRes.data || []).map((company) => [company.id, company]));
  const profilesById = new Map((profilesRes.data || []).map((profile) => [profile.id, profile]));

  return tickets.map((ticket) => {
    const company = ticket.company_id ? companiesById.get(ticket.company_id) : null;
    const profile = ticket.created_by ? profilesById.get(ticket.created_by) : null;

    return {
      id: ticket.id,
      company_id: ticket.company_id,
      company_name: company?.name || "Unknown workspace",
      submitted_by: profile?.full_name || "Unknown user",
      submitted_by_email: profile?.email || null,
      subject: ticket.subject,
      description: ticket.description,
      status: normalizeStatus(ticket.status) || "pending",
      created_at: ticket.created_at,
    };
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = normalizeStatus(searchParams.get("status"));
    const { supabaseAdmin } = await requireRole(request, ["superadmin"]);

    let query = supabaseAdmin
      .from("support_tickets")
      .select("id, company_id, created_by, subject, description, status, created_at")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    const tickets = await hydrateTickets(supabaseAdmin, (data || []) as SupportTicketRow[]);
    return NextResponse.json({ data: tickets });
  } catch (error) {
    console.error("Superadmin support list error:", error);
    const safeError = getSafeErrorResponse(error, "Support tickets could not be loaded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function PATCH(request: Request) {
  try {
    const rateLimited = checkRateLimit(request, { keyPrefix: "superadmin-support-ticket", limit: 30, windowMs: 60_000 });
    if (rateLimited) return rateLimited;

    const { id, status } = await request.json();
    const ticketId = requireUuid(id, "Ticket ID");
    const safeStatus = normalizeStatus(status);
    if (!safeStatus) throw Object.assign(new Error("Invalid support ticket status."), { status: 400 });

    const { supabaseAdmin } = await requireRole(request, ["superadmin"]);
    const { data, error } = await supabaseAdmin
      .from("support_tickets")
      .update({ status: safeStatus })
      .eq("id", ticketId)
      .select("id, company_id, created_by, subject, description, status, created_at")
      .single();

    if (error) throw error;

    const [ticket] = await hydrateTickets(supabaseAdmin, [data as SupportTicketRow]);
    return NextResponse.json({ data: ticket });
  } catch (error) {
    console.error("Superadmin support update error:", error);
    const safeError = getSafeErrorResponse(error, "Support ticket could not be updated.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
