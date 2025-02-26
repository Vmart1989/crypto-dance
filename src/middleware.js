
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/register", request.url));
    }
    try {
      await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET));
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/register", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};
