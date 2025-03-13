// app/api/admin/users/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

async function isAdmin(tokenValue) {
  try {
    const { payload } = await jwtVerify(tokenValue, new TextEncoder().encode(JWT_SECRET));
    // user payload has a role property
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
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
