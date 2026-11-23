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
    // filtering by user ID with query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const transactions = await prisma.transaction.findMany({
      where: userId ? { userId: Number(userId) } : {},
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
