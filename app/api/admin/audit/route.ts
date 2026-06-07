import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit-log";

const REPORT_ACTION = "guard_report_submitted";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyIdParam = searchParams.get("companyId");
    const auth = await requireRole(request, ["company