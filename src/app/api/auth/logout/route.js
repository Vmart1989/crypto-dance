export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { clearSessionCookie, isSameOrigin, requireUser, revokeSession } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function POST(request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const auth = await requireUser(request);
  await revokeSession(request);
  if (auth) {
    await recordActivity({
      request,
      event: "auth.logout",
      category: "auth",
      summary: auth.user.role === "admin" ? "Admin signed out" : "User signed out",
      userId: auth.user.id,
      actorUserId: auth.user.role === "admin" ? auth.user.id : null,
    });
  }
  const response = NextResponse.json({ message: "Logged out" });
  clearSessionCookie(response);
  return response;
}
