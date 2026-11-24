// app/api/wallet/add/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSameOrigin, requireUser } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

export async function POST(request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const auth = await requireUser(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount } = await request.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Fetch the current wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: auth.user.id } });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Check maximum fiat balance constraint
    if (wallet.fiatBalance + amount > 100000) {
      return NextResponse.json({ error: "Maximum fiat balance exceeded" }, { status: 400 });
    }

    // Update wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: { userId: auth.user.id },
      data: { fiatBalance: wallet.fiatBalance + amount },
    });

    await recordActivity({
      request,
      event: "wallet.virtual_funds_added",
      category: "wallet",
      summary: `Added ${Number(amount).toFixed(2)} virtual funds`,
      userId: auth.user.id,
      metadata: { amount: Number(amount), balanceAfter: updatedWallet.fiatBalance },
    });

    return NextResponse.json({ message: "Balance updated", wallet: updatedWallet });
  } catch (error) {
    console.error("Error adding fiat balance:", error);
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
  }
}
