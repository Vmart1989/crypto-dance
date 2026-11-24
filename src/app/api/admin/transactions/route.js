// app/api/admin/transactions/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(10, Number(searchParams.get("limit")) || 30));
    const rawUserId = Number(searchParams.get("userId"));
    const userId = Number.isInteger(rawUserId) && rawUserId > 0 ? rawUserId : null;
    const type = ["buy", "sell", "deposit", "withdrawal"].includes(searchParams.get("type")) ? searchParams.get("type") : "";
    const q = (searchParams.get("q") || "").trim().slice(0, 100);
    const where = {
      ...(userId ? { userId } : {}),
      ...(type ? { type } : {}),
      ...(q ? { user: { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] } } : {}),
    };

    const [transactions, total, totals] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.groupBy({ by: ["fiatCurrency"], where, _sum: { fiatAmount: true }, _count: { _all: true } }),
    ]);
    return NextResponse.json({
      transactions,
      totals: totals.map((item) => ({ currency: item.fiatCurrency, amount: item._sum.fiatAmount || 0, count: item._count._all })),
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
