import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/billing/server";
import { runRetentionCleanup } from "@/lib/retention-cleanup";

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;
  const authHeader = request.headers.get("authorization") || "";
  const bearer = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  return bearer === cronSecret || request.headers.get("x-cron-secret") === cronSecret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized request." }, { status: 401 });
  }

  try {
    const result = await runRetentionCleanup(createSupabaseAdmin());
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Retention cleanup failed:", error);
    return NextResponse.json({ error: "Retention cleanup failed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
