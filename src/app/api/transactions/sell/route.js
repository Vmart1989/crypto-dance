// app/api/transactions/buy/route.js
export const runtime = "nodejs"; // Ensure Node.js runtime

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

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

    const userId = payload.userId;

    // Parse request body
    const {coinId, amount, price, fiatRevenue, fiatCurrency } = await request.json();

    // Validate the request data
    if (!coinId || !amount || !price || !fiatRevenue || !fiatCurrency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Check if the user has enough crypto funds
    // if (wallet.fiatBalance < fiatRevenue) {
    //   return NextResponse.json(
    //     { error: "Insufficient fiat funds" },
    //     { status: 400 }
    //   );
    // }

    // add fiat value to wallet
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: { fiatBalance: wallet.fiatBalance + fiatRevenue },
    });

    // Create a transaction record for the purchase
    const transaction = await prisma.transaction.create({
      data: {
        type: "sell",
        cryptoSymbol: coinId,
        amount: amount,
        price: Number(price), // Convert price to a number
        fiatAmount: fiatRevenue,
        fiatCurrency,
        user: { connect: { id: userId } },
      },
    });

    // Update user's crypto asset for this coin
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
        data: { balance: existingAsset.balance - amount },
        
      }) 
      if (!existingAsset) {
  return NextResponse.json({ error: "You do not own this coin." }, { status: 400 });
}
if (existingAsset.balance < amount) {
  return NextResponse.json({ error: "Insufficient coin balance." }, { status: 400 });
};
if (existingAsset.balance - amount === 0) {
    updatedCryptoAsset = await prisma.cryptoAsset.delete({
        where: { id: existingAsset.id },
      });
    
}

    } 
    

    // Optionally, fetch all crypto assets for the user if needed:
    const updatedCryptoAssets = await prisma.cryptoAsset.findMany({
      where: { userId },
    });

    // Return the updated wallet and crypto asset data
    return NextResponse.json({
      message: "Sell successful",
      updatedWallet,
      updatedCryptoAssets,
    });
  } catch (error) {
    console.log(error.stack);
    console.error("Error processing purchase:", error);
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}
