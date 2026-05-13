import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PUBLIC_COMPANY_FIELDS = [
  "name",
  "is_locked",
  "subscription_ends_at",
  "require_photo",
  "ask_phone",
  "ask_id",
  "ask_host",
  "ask_purpose",
  "ask_vehicle",
  "custom_fields",
  "enable_geofence",
  "lat",
  "lng",
  "geofence_radius",
  "plan_tier",
].join(", ");

type PublicCompany = {
  name: string;
  is_locked: boolean | null;
  subscription_ends_at: string | null;
  require_photo: boolean | null;
  ask_phone: boolean | null;
  ask_id: boolean | null;
  ask_host: boolean | null;
  ask_purpose: boolean | null;
  ask_vehicle: boolean | null;
  custom_fields: unknown;
  enable_geofence: boolean | null;
  lat: number | null;
  lng: number | null;
  geofence_radius: number | null;
  plan_tier: string | null;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "Missing company_id" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from("companies")
      .select(PUBLIC_COMPANY_FIELDS)
      .eq("id", companyId)
      .single();
    const company = data as PublicCompany | null;

    if (error || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (company.is_locked) {
      return NextResponse.json({ error: "Company unavailable" }, { status: 403 });
    }

    return NextResponse.json({ data: company });
  } catch (error: unknown) {
    console.error("Public company lookup failed:", error);
    return NextResponse.json({ error: "Failed to load company" }, { status: 500 });
  }
}
