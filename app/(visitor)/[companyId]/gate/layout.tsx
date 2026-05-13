import type { Metadata, ResolvingMetadata } from "next";
import { createClient } from "@supabase/supabase-js";

type GateLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
};

async function getCompanyName(companyId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("name")
    .eq("id", companyId)
    .single();

  return company?.name ?? null;
}

export async function generateMetadata(
  { params }: GateLayoutProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  void parent;

  const { companyId } = await params;
  const companyName = await getCompanyName(companyId);
  const facilityName = companyName || "Gate";

  return {
    title: `Visitor Check-in | ${facilityName}`,
    description: `Official visitor registration gate for ${companyName || "this facility"}, powered by Karibu VMS. Fast, secure, and touchless check-in.`,
  };
}

export default function GateLayout({ children }: GateLayoutProps) {
  return children;
}
