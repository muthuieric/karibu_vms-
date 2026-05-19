import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/billing/server";

export type AppRole = "superadmin" | "company_admin" | "guard";

export type AuthenticatedProfile = {
  id: string;
  company_id: string | null;
  role: AppRole;
  full_name?: string | null;
  email?: string | null;
};

export type AuthenticatedRequest = {
  user: User;
  profile: AuthenticatedProfile;
  supabaseAdmin: SupabaseClient;
};

const ROLE_ALIASES: Record<string, AppRole> = {
  superadmin: "superadmin",
  super_admin: "superadmin",
  company_admin: "company_admin",
  "company-admin": "company_admin",
  guard: "guard",
};

export function normalizeRole(role?: string | null): AppRole | null {
  return ROLE_ALIASES[String(role || "").trim().toLowerCase()] || null;
}

function bearerTokenFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

export async function requireAuthenticatedRequest(request: Request): Promise<AuthenticatedRequest> {
  const token = bearerTokenFromRequest(request);
  if (!token) throw Object.assign(new Error("Unauthorized request."), { status: 401 });

  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: authData, error: authError } = await supabaseAnon.auth.getUser(token);
  if (authError || !authData.user) {
    throw Object.assign(new Error("Unauthorized request."), { status: 401 });
  }

  const supabaseAdmin = createSupabaseAdmin();
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, company_id, role, full_name, email")
    .eq("id", authData.user.id)
    .single();

  const normalizedRole = normalizeRole(profile?.role);
  if (profileError || !profile || !normalizedRole) {
    throw Object.assign(new Error("Unauthorized request."), { status: 401 });
  }

  return {
    user: authData.user,
    profile: {
      id: profile.id,
      company_id: profile.company_id,
      role: normalizedRole,
      full_name: profile.full_name,
      email: profile.email,
    },
    supabaseAdmin,
  };
}

export async function requireRole(request: Request, allowedRoles: AppRole[]) {
  const auth = await requireAuthenticatedRequest(request);
  if (!allowedRoles.includes(auth.profile.role)) {
    throw Object.assign(new Error("Unauthorized request."), { status: 403 });
  }
  return auth;
}

export function assertCompanyAccess(profile: AuthenticatedProfile, companyId: string) {
  if (profile.role === "superadmin") return;
  if (!profile.company_id || profile.company_id !== companyId) {
    throw Object.assign(new Error("Unauthorized request."), { status: 403 });
  }
}

export function getSafeErrorResponse(error: unknown, fallback = "Request could not be completed.") {
  const status = typeof error === "object" && error && "status" in error ? Number((error as { status?: number }).status) : 500;
  const safeStatus = Number.isInteger(status) && status >= 400 && status < 600 ? status : 500;
  const message = safeStatus >= 500 ? fallback : error instanceof Error ? error.message : fallback;
  return { message, status: safeStatus };
}
