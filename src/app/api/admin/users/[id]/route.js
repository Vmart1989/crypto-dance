export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSameOrigin, requireAdmin } from "@/lib/auth";
import { recordActivity } from "@/lib/activity";

// GET handler to fetch a single user's details
export async function GET(request, context) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await Promise.resolve(context.params);
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, role: true, createdAt: true,
        emailVerifiedAt: true, wallet: true,
        cryptoAssets: { orderBy: { balance: "desc" } },
        transactions: { orderBy: { createdAt: "desc" }, take: 20 },
        sessions: { where: { revokedAt: null, expiresAt: { gt: new Date() } }, select: { id: true, createdAt: true, expiresAt: true } },
        _count: { select: { transactions: true, sessions: true } },
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const activity = await prisma.activityLog.findMany({
      where: { OR: [{ userId }, { actorUserId: userId }] },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
    return NextResponse.json({ user, activity });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(request, context) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const adminAuth = await requireAdmin(request);
  if (!adminAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await Promise.resolve(context.params);
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId <= 0) return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    const { fiatBalance, role } = await request.json();
    if (!['user', 'admin'].includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    if (fiatBalance !== undefined && (!Number.isFinite(Number(fiatBalance)) || Number(fiatBalance) < 0 || Number(fiatBalance) > 100000)) {
      return NextResponse.json({ error: "Invalid fiat balance" }, { status: 400 });
    }

    if (adminAuth.user.id === userId && role !== "admin") {
      return NextResponse.json({ error: "You cannot remove your own admin access" }, { status: 400 });
    }

    const previous = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true, wallet: { select: { fiatBalance: true } } } });
    if (!previous) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const operations = [
      prisma.user.update({
        where: { id: userId },
        data: { role },
        select: { id: true, email: true, name: true, role: true, createdAt: true, emailVerifiedAt: true },
      }),
    ];
    if (fiatBalance !== undefined) {
      operations.push(prisma.wallet.upsert({
        where: { userId },
        create: { userId, fiatBalance: Number(fiatBalance) },
        update: { fiatBalance: Number(fiatBalance) },
      }));
    }
    const [updatedUser, updatedWallet = previous.wallet] = await prisma.$transaction(operations);

    await recordActivity({
      request,
      event: "admin.user_updated",
      category: "admin",
      summary: `Admin updated ${previous.email}`,
      userId,
      actorUserId: adminAuth.user.id,
      metadata: {
        roleBefore: previous.role,
        roleAfter: role,
        balanceBefore: previous.wallet?.fiatBalance ?? null,
        balanceAfter: fiatBalance !== undefined ? Number(fiatBalance) : previous.wallet?.fiatBalance ?? null,
      },
    });

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
  const adminAuth = await requireAdmin(request);
  if (!adminAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  if (adminAuth.user.id === userId) return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  
  try {
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true, role: true } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    // Delete dependent records first, then delete the user
    await prisma.$transaction([
      prisma.wallet.deleteMany({ where: { userId } }),
      prisma.cryptoAsset.deleteMany({ where: { userId } }),
      prisma.transaction.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
    await recordActivity({
      request,
      event: "admin.user_deleted",
      category: "admin",
      summary: `Admin deleted ${target.email}`,
      userId,
      actorUserId: adminAuth.user.id,
      metadata: { email: target.email, name: target.name, role: target.role },
    });
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
