// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user and optionally create a wallet (if needed)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        
       wallet: { create: { fiatBalance: 0 } },
      },
    });

    return NextResponse.json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
