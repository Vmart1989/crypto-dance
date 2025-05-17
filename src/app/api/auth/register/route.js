// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the default role ("user" as defined in schema)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        wallet: { create: { fiatBalance: 0 } },
      },
    });

    // Generate a JWT token including the role in the payload
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role, // role is assumed to be "user" by default
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(JWT_SECRET));

    const response = NextResponse.json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // secure cookies in production
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
