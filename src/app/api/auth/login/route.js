export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  clearAuthAttempts,
  createSession,
  getDummyPasswordHash,
  isRateLimited,
  isSameOrigin,
  loginThrottleKeys,
  recordAuthAttempt,
  setSessionCookie,
  validateLoginInput,
} from "@/lib/auth";

export async function POST(request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 8192) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  try {
    const input = validateLoginInput(await request.json());
    const throttleKeys = loginThrottleKeys(request, input.email);
    if (await isRateLimited(throttleKeys)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const user = input.valid ? await prisma.user.findFirst({ where: { email: { equals: input.email, mode: "insensitive" } } }) : null;
    const passwordValid = await bcrypt.compare(input.password || "invalid", user?.password || getDummyPasswordHash());
    if (!input.valid || !user || !passwordValid) {
      await recordAuthAttempt(throttleKeys, { failed: true });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (!user.emailVerifiedAt) {
      await recordAuthAttempt(throttleKeys, { failed: true });
      return NextResponse.json({ error: "Verify your email before signing in." }, { status: 403 });
    }

    await clearAuthAttempts(throttleKeys);
    await prisma.session.deleteMany({ where: { expiresAt: { lte: new Date() } } });
    const session = await createSession(user.id);
    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error("Login failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Login is temporarily unavailable" }, { status: 503 });
  }
}
