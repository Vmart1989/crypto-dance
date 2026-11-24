export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const categories = new Set(["account", "auth", "trading", "wallet", "admin"]);

export async function GET(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(10, Number(searchParams.get("limit")) || 30));
    const categoryParam = searchParams.get("category") || "";
    const event = (searchParams.get("event") || "").slice(0, 80);
    const q = (searchParams.get("q") || "").trim().slice(0, 100);
    const rawUserId = Number(searchParams.get("userId"));
    const userId = Number.isInteger(rawUserId) && rawUserId > 0 ? rawUserId : null;
    const category = categories.has(categoryParam) ? categoryParam : "";

    const filters = [
      ...(userId ? [{ OR: [{ userId }, { actorUserId: userId }] }] : []),
      ...(q ? [{ OR: [{ summary: { contains: q, mode: "insensitive" } }, { event: { contains: q, mode: "insensitive" } }] }] : []),
    ];
    const where = {
      ...(category ? { category } : {}),
      ...(event ? { event } : {}),
      ...(filters.length ? { AND: filters } : {}),
    };

    const [logs, total, eventGroups] = await Promise.all([
      prisma.activityLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.activityLog.count({ where }),
      prisma.activityLog.groupBy({ by: ["event"], _count: { _all: true }, orderBy: { event: "asc" } }),
    ]);
    const ids = [...new Set(logs.flatMap((item) => [item.userId, item.actorUserId]).filter(Boolean))];
    const people = ids.length
      ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, email: true } })
      : [];
    const peopleById = Object.fromEntries(people.map((person) => [person.id, person]));

    return NextResponse.json({
      logs: logs.map((item) => ({
        ...item,
        user: item.userId ? peopleById[item.userId] || null : null,
        actor: item.actorUserId ? peopleById[item.actorUserId] || null : null,
      })),
      events: eventGroups.map((item) => ({ event: item.event, count: item._count._all })),
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    console.error("Admin activity failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Failed to load activity" }, { status: 500 });
  }
}
