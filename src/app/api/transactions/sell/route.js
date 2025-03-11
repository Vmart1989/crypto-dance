export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  const token = request.cookies.get("token");
  if (!token || !token.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify token and extract payload
    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(JWT_SECRET)
    );
    const userId = payload.userId;

    // Parse request body - note: we expect both coinId and coinSymbol
    const { coinId, coinSymbol, amount, price, fiatRevenue, fiatCurrency } = await request.json();

    if (!coinId || !coinSymbol || !amount || !price || !fiatRevenue || !fiatCurrency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Retrieve the user's wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Add fiat value to wallet (for sale, you add the revenue)
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: { fiatBalance: wallet.fiatBalance + Number(fiatRevenue) },
    });

    // Create a transaction record for the sale
    const transaction = await prisma.transaction.create({
      data: {
        type: "sell",
        cryptoSymbol: coinSymbol,  // e.g. "BTC"
        coinId: coinId,            // e.g. "bitcoin"
        amount: Number(amount),
        price: Number(price),
        fiatAmount: Number(fiatRevenue),
        fiatCurrency,
        user: { connect: { id: userId } },
      },
    });

    // Update user's crypto asset using coinId to match
    const existingAsset = await prisma.cryptoAsset.findFirst({
      where: {
        userId,
        coinId: coinId,
      },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "You do not own this coin." }, { status: 400 });
    }
    if (existingAsset.balance < Number(amount)) {
      return NextResponse.json({ error: "Insufficient coin balance." }, { status: 400 });
    }

    let updatedCryptoAsset;
    if (existingAsset.balance - Number(amount) === 0) {
      updatedCryptoAsset = await prisma.cryptoAsset.delete({
        where: { id: existingAsset.id },
      });
    } else {
      updatedCryptoAsset = await prisma.cryptoAsset.update({
        where: { id: existingAsset.id },
        data: { balance: existingAsset.balance - Number(amount) },
      });
    }

    // Fetch the updated crypto assets
    const updatedCryptoAssets = await prisma.cryptoAsset.findMany({
      where: { userId },
    });

    return NextResponse.json({
      message: "Sell successful",
      updatedWallet,
      updatedCryptoAssets,
    });
  } catch (error) {
    console.error("Error processing sale:", error);
    return NextResponse.json({ error: "Failed to process sale" }, { status: 500 });
  }
}
