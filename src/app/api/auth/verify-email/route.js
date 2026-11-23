export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificationTokenHash } from "@/lib/auth";

export async function GET(request) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const redirectUrl = new URL("/register", request.url);
  if (token.length < 32 || token.length > 128) {
    redirectUrl.searchParams.set("verification", "invalid");
    return NextResponse.redirect(redirectUrl);
  }
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: verificationTokenHash(token) } });
  if (!record || record.expiresAt <= new Date()) {
    if (record) await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    redirectUrl.searchParams.set("verification", "expired");
    return NextResponse.redirect(redirectUrl);
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);
  redirectUrl.searchParams.set("verification", "success");
  return NextResponse.redirect(redirectUrl);
}
