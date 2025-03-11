// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  const token = request.cookies.get("token");
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(JWT_SECRET)
    );
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        wallet: true,
        cryptoAssets: true,
        transactions: true, // Include transactions here
      },
    });
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        wallet: user.wallet,
        cryptoAssets: user.cryptoAssets,
        transactions: user.transactions, // Return transactions to the client
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
