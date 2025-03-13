import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

// Define public admin paths that don't require token check.
const publicAdminPaths = ["/admin/login"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // If it's an admin route, allow public pages first.
  if (pathname.startsWith("/admin")) {
    if (publicAdminPaths.includes(pathname)) {
      return NextResponse.next();
    }
    const token = request.cookies.get("token");
    if (!token || !token.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(
        token.value,
        new TextEncoder().encode(JWT_SECRET)
      );
      if (!payload || payload.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch (error) {
      console.error("Error verifying admin token:", error);
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // For non-admin dashboard routes, do a basic token check.
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("token");
    if (!token || !token.value) {
      return NextResponse.redirect(new URL("/register", request.url));
    }
    try {
      await jwtVerify(
        token.value,
        new TextEncoder().encode(JWT_SECRET)
      );
    } catch (error) {
      return NextResponse.redirect(new URL("/register", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
