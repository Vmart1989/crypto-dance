export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

async function isAdmin(tokenValue) {
  try {
    const { payload } = await jwtVerify(
      tokenValue,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload.role === "admin";
  } catch (error) {
    return false;
  }
}

// GET handler to fetch a single user's details
export async function GET(request, { params }) {
  const token = request.cookies.get("token");
  if (!token || !token.value || !(await isAdmin(token.value))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { wallet: true, cryptoAssets: true, transactions: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const token = request.cookies.get("token");
  if (!token || !token.value || !(await isAdmin(token.value))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = params;
    const { fiatBalance, role } = await request.json();

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
    });

    // Update the wallet's fiat balance if provided
    let updatedWallet = null;
    if (fiatBalance !== undefined) {
      updatedWallet = await prisma.wallet.update({
        where: { userId: Number(id) },
        data: { fiatBalance: Number(fiatBalance) },
      });
    }

    return NextResponse.json({
      message: "User updated",
      user: { ...updatedUser, wallet: updatedWallet },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  
  const params = await Promise.resolve(context.params);
  const { id } = params;
  
  const tokenObj = request.cookies.get("token");
  if (!tokenObj || !tokenObj.value || !(await isAdmin(tokenObj.value))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // Delete dependent records first, then delete the user
    await prisma.$transaction([
      prisma.wallet.deleteMany({ where: { userId: Number(id) } }),
      prisma.cryptoAsset.deleteMany({ where: { userId: Number(id) } }),
      prisma.transaction.deleteMany({ where: { userId: Number(id) } }),
      prisma.user.delete({ where: { id: Number(id) } }),
    ]);
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    return NextResponse.json(
      { error: "Failed to delete user: " + error.message },
      { status: 500 }
    );
  }
}
