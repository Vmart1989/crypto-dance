export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSameOrigin, requireAdmin } from "@/lib/auth";

// GET handler to fetch a single user's details
export async function GET(request, { params }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true, email: true, name: true, role: true, createdAt: true,
        emailVerifiedAt: true, wallet: true, cryptoAssets: true, transactions: true,
      },
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
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = params;
    const { fiatBalance, role } = await request.json();
    if (!['user', 'admin'].includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    if (fiatBalance !== undefined && (!Number.isFinite(Number(fiatBalance)) || Number(fiatBalance) < 0 || Number(fiatBalance) > 100000)) {
      return NextResponse.json({ error: "Invalid fiat balance" }, { status: 400 });
    }

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, email: true, name: true, role: true, createdAt: true, emailVerifiedAt: true },
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
  
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (!(await requireAdmin(request))) {
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
    console.error("Error deleting user:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
