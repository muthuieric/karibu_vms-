import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthenticatedProfile } from "@/lib/api-auth";
import { assertCompanyAccess } from "@/lib/api-auth";

export async function assertResourceCompanyAccess(
  supabaseAdmin: SupabaseClient,
  profile: AuthenticatedProfile,
  table: string,
  id: string
) {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select("company_id")
    .eq("id", id)
    .single();

  if (error || !data?.company_id) {
    throw Object.assign(new Error("Resource not found."), { status: 404 });
  }

  assertCompanyAccess(profile, data.company_id);
  return data.company_id as string;
}
