export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(request) {
  const auth = await requireUser(request);
  if (!auth) return NextResponse.json({ user: null }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    include: { wallet: true, cryptoAssets: true, transactions: true },
  });
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: {
      id: user.id, email: user.email, name: user.name, role: user.role,
      wallet: user.wallet, cryptoAssets: user.cryptoAssets, transactions: user.transactions,
    },
  });
}
