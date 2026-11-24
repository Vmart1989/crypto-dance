import { randomBytes } from "node:crypto";
import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashToken, isRateLimited, isSameOrigin, isValidEmail, normalizeEmail,
  passwordResetThrottleKeys, recordAuthAttempt,
} from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { localizePath, normalizeLocale } from "@/i18n/config";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 8192) return NextResponse.json({}, { status: 413 });
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const keys = passwordResetThrottleKeys(request, email);
  try {
    if (await isRateLimited(keys)) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    await recordAuthAttempt(keys);
  } catch {
    return NextResponse.json({ error: "Password reset is temporarily unavailable." }, { status: 503 });
  }

  const path = localizePath("/reset-password", normalizeLocale(body?.locale));
  after(async () => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" }, emailVerifiedAt: { not: null } },
        select: { id: true, email: true },
      });
      if (!user) return;

      const token = randomBytes(32).toString("base64url");
      const data = { tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 30 * 60 * 1000) };
      await prisma.passwordResetToken.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...data },
        update: data,
      });
      await sendPasswordResetEmail({ email: user.email, token, path });
    } catch {
      console.error("Password reset email could not be prepared or sent");
    }
  });
  return NextResponse.json({}, { status: 202 });
}
