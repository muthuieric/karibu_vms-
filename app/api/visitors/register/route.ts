import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type VisitorRegistrationPayload = {
  company_id?: string;
  gate_id?: string | null;
  name?: string;
  phone?: string | null;
  document_type?: string | null;
  id_number?: string | null;
  host_id?: string | null;
  host_name?: string | null;
  purpose?: string | null;
  vehicle_reg?: string | null;
  photo_url?: string | null;
  custom_data?: Record<string, string>;
};

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const payload = (await request.json()) as VisitorRegistrationPayload;

    if (!payload.company_id || !payload.name?.trim()) {
      return NextResponse.json({ error: "Missing required visitor details" }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .select("id, is_locked")
      .eq("id", payload.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (company.is_locked) {
      return NextResponse.json({ error: "Company check-in is unavailable" }, { status: 403 });
    }

    let safeGateId: string | null = null;
    if (payload.gate_id) {
      const { data: gate } = await supabaseAdmin
        .from("gates")
        .select("id")
        .eq("id", payload.gate_id)
        .eq("company_id", payload.company_id)
        .maybeSingle();

      safeGateId = gate?.id ?? null;
    }

    const { data, error } = await supabaseAdmin
      .from("visitors")
      .insert([
        {
          company_id: payload.company_id,
          name: payload.name.trim(),
          phone: payload.phone || "",
          document_type: payload.document_type || null,
          id_number: payload.id_number || null,
          host_id: payload.host_id || null,
          host_name: payload.host_name || null,
          purpose: payload.purpose || null,
          vehicle_reg: payload.vehicle_reg || null,
          status: "pending",
          photo_url: payload.photo_url || null,
          custom_data: payload.custom_data || {},
          gate_id: safeGateId,
        },
      ])
      .select("id, company_id, gate_id, status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Public visitor registration failed:", error);
    return NextResponse.json({ error: "Failed to register visitor" }, { status: 500 });
  }
}
