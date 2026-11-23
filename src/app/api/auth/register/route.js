export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  createVerificationToken,
  isBreachedPassword,
  isRateLimited,
  isSameOrigin,
  recordAuthAttempt,
  registrationThrottleKeys,
  setSessionCookie,
  validateRegistrationInput,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

const genericMessage = "If the address can be registered, check your email for the next step.";

export async function POST(request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 8192) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  try {
    const body = await request.json();
    const input = validateRegistrationInput(body);
    if (!input.valid) return NextResponse.json({ error: input.errors[0] }, { status: 400 });

    const throttleKeys = registrationThrottleKeys(request, input.email);
    if (await isRateLimited(throttleKeys)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }
    await recordAuthAttempt(throttleKeys, { failed: true });

    if (await isBreachedPassword(input.password)) {
      return NextResponse.json({ error: "That password has appeared in a data breach. Choose a different password." }, { status: 400 });
    }

    // Perform the expensive hash before checking account existence to reduce
    // registration timing differences between new and existing addresses.
    const passwordHash = await bcrypt.hash(input.password, 12);
    const existing = await prisma.user.findFirst({ where: { email: { equals: input.email, mode: "insensitive" } } });
    if (existing) {
      if (!existing.emailVerifiedAt && process.env.NODE_ENV === "production") {
        const verification = createVerificationToken();
        await prisma.$transaction([
          prisma.emailVerificationToken.deleteMany({ where: { userId: existing.id } }),
          prisma.emailVerificationToken.create({ data: { userId: existing.id, tokenHash: verification.tokenHash, expiresAt: verification.expiresAt } }),
        ]);
        await sendVerificationEmail({ email: existing.email, token: verification.token });
      }
      return NextResponse.json({ message: genericMessage, requiresVerification: true }, { status: 202 });
    }

    const autoVerify = process.env.NODE_ENV !== "production";
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: passwordHash,
        name: input.name,
        emailVerifiedAt: autoVerify ? new Date() : null,
        wallet: { create: { fiatBalance: 0 } },
      },
    });

    if (!autoVerify) {
      const verification = createVerificationToken();
      await prisma.emailVerificationToken.create({ data: { userId: user.id, tokenHash: verification.tokenHash, expiresAt: verification.expiresAt } });
      await sendVerificationEmail({ email: user.email, token: verification.token });
      return NextResponse.json({ message: genericMessage, requiresVerification: true }, { status: 202 });
    }

    const session = await createSession(user.id);
    const response = NextResponse.json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { status: 201 });
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error("Registration failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Registration is temporarily unavailable" }, { status: 503 });
  }
}
