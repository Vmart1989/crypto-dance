export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSameOrigin, requireUser } from "@/lib/auth";

export async function POST(request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const auth = await requireUser(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = auth.user.id;

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
