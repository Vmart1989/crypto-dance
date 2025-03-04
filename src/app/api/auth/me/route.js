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
    // Include the wallet in the query so that user.wallet is populated
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { wallet: true, cryptoAssets: true },
    });
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        wallet: user.wallet, // Ensure wallet is returned (should have fiatBalance)
        cryptoAssets: user.cryptoAssets,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
