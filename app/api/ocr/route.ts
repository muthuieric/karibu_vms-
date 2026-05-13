import { NextResponse } from "next/server";

export async function POST(req: Request) {
  void req;

  // ID OCR scanning is intentionally disabled. Keep this route as a clear
  // no-op so old clients fail gracefully without calling an OCR provider.
  return NextResponse.json(
    { error: "ID OCR scanning is disabled." },
    { status: 410 }
  );
}
