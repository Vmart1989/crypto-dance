import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, hashToken, isBreachedPassword, isSameOrigin, passwordErrors } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export const runtime = "nodejs";

class InvalidResetLink extends Error {}

export async function POST(request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 8192) return NextResponse.json({}, { status: 413 });
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const invalidLink = () => NextResponse.json({ error: "This reset link is invalid or expired. Request a new link." }, { status: 400 });
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return invalidLink();

  const [error] = passwordErrors(password);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    const tokenHash = hashToken(token);
    const reset = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!reset || reset.expiresAt <= new Date()) return invalidLink();

    const breached = await isBreachedPassword(password).catch(() => {
      console.warn("Password breach check unavailable during password reset");
      return false;
    });
    if (breached) return NextResponse.json({ error: "That password has appeared in a data breach. Choose a different password." }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.passwordResetToken.deleteMany({
        where: { tokenHash, expiresAt: { gt: new Date() } },
      });
      if (claimed.count !== 1) throw new InvalidResetLink();
      await tx.user.update({ where: { id: reset.userId }, data: { password: passwordHash } });
      await tx.session.updateMany({
        where: { userId: reset.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    await recordActivity({ request, event: "account.password_reset", category: "account", summary: "Password reset completed", userId: reset.userId });
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    if (error instanceof InvalidResetLink) return invalidLink();
    console.error("Password reset failed");
    return NextResponse.json({ error: "Password reset is temporarily unavailable." }, { status: 503 });
  }
}
