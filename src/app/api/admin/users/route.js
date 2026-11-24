// app/api/admin/users/route.js
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
    const limit = Math.min(100, Math.max(10, Number(searchParams.get("limit")) || 25));
    const q = (searchParams.get("q") || "").trim().slice(0, 100);
    const role = ["user", "admin"].includes(searchParams.get("role")) ? searchParams.get("role") : "";
    const verification = searchParams.get("verification") || "";
    const where = {
      ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] } : {}),
      ...(role ? { role } : {}),
      ...(verification === "verified" ? { emailVerifiedAt: { not: null } } : {}),
      ...(verification === "pending" ? { emailVerifiedAt: null } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, email: true, name: true, role: true, createdAt: true, emailVerifiedAt: true,
          wallet: { select: { fiatBalance: true } },
          _count: { select: { transactions: true, sessions: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return NextResponse.json({ users, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
