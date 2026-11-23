export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { clearSessionCookie, isSameOrigin, revokeSession } from "@/lib/auth";

export async function POST(request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  await revokeSession(request);
  const response = NextResponse.json({ message: "Logged out" });
  clearSessionCookie(response);
  return response;
}
