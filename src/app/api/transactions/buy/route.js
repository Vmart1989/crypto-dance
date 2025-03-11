export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  const tokenObj = request.cookies.get("token");
  if (!tokenObj || !tokenObj.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(
      tokenObj.value,
      new TextEncoder().encode(JWT_SECRET)
    );
    const userId = payload.userId;

    // We expect the request body to include coinId, coinSymbol, etc.
    const { coinId, coinSymbol, amount, price, fiatCost, fiatCurrency } =
      await request.json();

    if (!coinId || !coinSymbol || !amount || !price || !fiatCost || !fiatCurrency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (wallet.fiatBalance < fiatCost) {
      return NextResponse.json({ error: "Insufficient fiat funds" }, { status: 400 });
    }

    // Deduct from wallet
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: { fiatBalance: wallet.fiatBalance - fiatCost },
    });

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        type: "buy",
        cryptoSymbol: coinSymbol, // e.g. "BTC"
        coinId: coinId,           // e.g. "bitcoin"
        amount: Number(amount),
        price: Number(price),
        fiatAmount: Number(fiatCost),
        fiatCurrency,
        user: { connect: { id: userId } },
      },
    });

    // Update or create CryptoAsset
    // We'll match existing assets by BOTH coinId AND symbol
    // If you only want to match by coinId, do coinId: coinId
    let updatedCryptoAsset;
    const existingAsset = await prisma.cryptoAsset.findFirst({
      where: {
        userId,
        coinId: coinId,   // or symbol: coinSymbol, if you prefer
      },
    });

    if (existingAsset) {
      updatedCryptoAsset = await prisma.cryptoAsset.update({
        where: { id: existingAsset.id },
        data: {
          balance: existingAsset.balance + Number(amount),
        },
      });
    } else {
      updatedCryptoAsset = await prisma.cryptoAsset.create({
        data: {
          symbol: coinSymbol,   // e.g. "BTC"
          coinId: coinId,       // e.g. "bitcoin"
          balance: Number(amount),
          user: { connect: { id: userId } },
        },
      });
    }

    const updatedCryptoAssets = await prisma.cryptoAsset.findMany({
      where: { userId },
    });

    return NextResponse.json({
      message: "Purchase successful",
      updatedWallet,
      updatedCryptoAssets,
    });
  } catch (error) {
    console.error("Error processing purchase:", error);
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 });
  }
}
