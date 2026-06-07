import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit-log";

export async function POST(request: Request) {
  try {
    const { action, resourceType, resourceId, metadata, companyId } = await request.json();
    const auth = await requireRole(request, ["company_admin", "superadmin"]);
    const safeCompanyId = auth.profile.role === "superadmin" ? companyId || auth.profile.company_id : auth.profile.company_id;

    if (!safe