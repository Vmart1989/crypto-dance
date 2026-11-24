export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
    fourteenDaysAgo.setUTCHours(0, 0, 0, 0);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      verifiedUsers,
      newUsers7d,
      activeSessions,
      totalTransactions,
      transactions24h,
      volumeByCurrency,
      transactionTypes,
      recentUsers,
      recentActivity,
      registrationDates,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { emailVerifiedAt: { not: null } } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.session.count({ where: { revokedAt: null, expiresAt: { gt: now } } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.transaction.groupBy({ by: ["fiatCurrency"], _sum: { fiatAmount: true } }),
      prisma.transaction.groupBy({ by: ["type"], _count: { _all: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, name: true, email: true, role: true, createdAt: true, emailVerifiedAt: true },
      }),
      prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
      prisma.user.findMany({ where: { createdAt: { gte: fourteenDaysAgo } }, select: { createdAt: true } }),
    ]);

    const ids = [...new Set(recentActivity.flatMap((item) => [item.userId, item.actorUserId]).filter(Boolean))];
    const people = ids.length
      ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, email: true } })
      : [];
    const peopleById = Object.fromEntries(people.map((person) => [person.id, person]));

    const counts = Object.fromEntries(registrationDates.map(({ createdAt }) => [dayKey(createdAt), 0]));
    registrationDates.forEach(({ createdAt }) => {
      const key = dayKey(createdAt);
      counts[key] = (counts[key] || 0) + 1;
    });
    const registrationSeries = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(fourteenDaysAgo.getTime() + index * 24 * 60 * 60 * 1000);
      const key = dayKey(date);
      return { date: key, count: counts[key] || 0 };
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        verifiedUsers,
        verificationRate: totalUsers ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
        newUsers7d,
        activeSessions,
        totalTransactions,
        transactions24h,
      },
      volumeByCurrency: volumeByCurrency.map((item) => ({ currency: item.fiatCurrency, amount: item._sum.fiatAmount || 0 })),
      transactionTypes: transactionTypes.map((item) => ({ type: item.type, count: item._count._all })),
      registrationSeries,
      recentUsers,
      recentActivity: recentActivity.map((item) => ({
        ...item,
        user: item.userId ? peopleById[item.userId] || null : null,
        actor: item.actorUserId ? peopleById[item.actorUserId] || null : null,
      })),
    });
  } catch (error) {
    console.error("Admin dashboard failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
