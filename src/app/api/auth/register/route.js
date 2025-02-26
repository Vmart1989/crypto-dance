// app/api/auth/register/route.js


import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        wallet: { create: { fiatBalance: 0 } },
      },
    });

    // Generate a JWT token
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Create the response and set the HTTP‑only cookie
    const response = NextResponse.json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email, name: user.name },
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // For local dev, ensure this is false
      maxAge: 3600, // 1 hour
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed: " + error.message }, { status: 500 });
  }
}
