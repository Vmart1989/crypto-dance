// app/api/transactions/buy/route.js
export const runtime = "nodejs"; // Ensure Node.js runtime

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  // Get token from cookies
  const tokenObj = request.cookies.get("token");
if (!tokenObj || !tokenObj.value) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
  try {
    // Verify token and extract payload
    const { payload } = await jwtVerify(
        tokenObj.value,
        new TextEncoder().encode(JWT_SECRET)
      );
    const userId = payload.userId;

    // Parse request body
    const { coinId, amount, price, fiatCost } = await request.json();

    // Validate the request data
    if (!coinId || !amount || !price || !fiatCost) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Retrieve the user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Check if the user has enough fiat funds
    if (wallet.fiatBalance < fiatCost) {
      return NextResponse.json(
        { error: "Insufficient fiat funds" },
        { status: 400 }
      );
    }

    // Deduct fiat cost from the wallet
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: { fiatBalance: wallet.fiatBalance - fiatCost },
    });

    // Create a transaction record for the purchase
    const transaction = await prisma.transaction.create({
      data: {
        type: "buy",
        cryptoSymbol: coinId, // Assuming coinId matches the symbol; adjust if needed.
        amount: amount,
        price: price,
        fiatAmount: fiatCost,
        user: { connect: { id: userId } },
      },
    });

    // Update or create the user's crypto asset for this coin
    let updatedCryptoAsset;
    const existingAsset = await prisma.cryptoAsset.findFirst({
      where: {
        userId,
        symbol: coinId, // Adjust if coinId differs from symbol.
      },
    });

    if (existingAsset) {
      updatedCryptoAsset = await prisma.cryptoAsset.update({
        where: { id: existingAsset.id },
        data: { balance: existingAsset.balance + amount },
      });
    } else {
      updatedCryptoAsset = await prisma.cryptoAsset.create({
        data: {
          symbol: coinId, // Adjust if necessary.
          balance: amount,
          user: { connect: { id: userId } },
        },
      });
    }

    // Optionally, fetch all crypto assets for the user if needed:
    const updatedCryptoAssets = await prisma.cryptoAsset.findMany({
      where: { userId },
    });

    // Return the updated wallet and crypto asset data
    return NextResponse.json({
      message: "Purchase successful",
      updatedWallet,
      updatedCryptoAssets,
    });
  } catch (error) {
    console.error("Error processing purchase:", error);
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}
