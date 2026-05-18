import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error("Guards count error: Missing Service Role Key");
    return NextResponse.json({ count: 0, error: "Missing Service Role Key" }, { status: 500 });
  }

  if (!supabaseUrl) {
    console.error("Guards count error: Missing Supabase URL");
    return NextResponse.json({ count: 0, error: "Missing Supabase URL" }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { count, error } = await supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "guard");
  const errorMessage = error?.message;

  if (error) {
    console.error("Guards count query error:", error);
    return NextResponse.json({ count: count || 0, error: errorMessage }, { status: 500 });
  }

  return NextResponse.json({ count: count || 0, error: errorMessage });
}
