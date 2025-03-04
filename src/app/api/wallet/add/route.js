// app/api/wallet/add/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  // Retrieve token from cookies
  const token = request.cookies.get("token");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify token and extract payload
    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(JWT_SECRET)
    );

    const { amount } = await request.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Fetch the current wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: payload.userId } });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Check maximum fiat balance constraint
    if (wallet.fiatBalance + amount > 100000) {
      return NextResponse.json({ error: "Maximum fiat balance exceeded" }, { status: 400 });
    }

    // Update wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: { userId: payload.userId },
      data: { fiatBalance: wallet.fiatBalance + amount },
    });

    return NextResponse.json({ message: "Balance updated", wallet: updatedWallet });
  } catch (error) {
    console.error("Error adding fiat balance:", error);
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
  }
}
