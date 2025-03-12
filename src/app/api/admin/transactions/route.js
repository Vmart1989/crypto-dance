// app/api/admin/transactions/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

async function isAdmin(tokenValue) {
  try {
    const { payload } = await jwtVerify(tokenValue, new TextEncoder().encode(JWT_SECRET));
    return payload.role === "admin";
  } catch (error) {
    return false;
  }
}

export async function GET(request) {
  const token = request.cookies.get("token");
  if (!token || !token.value || !(await isAdmin(token.value))) {
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
