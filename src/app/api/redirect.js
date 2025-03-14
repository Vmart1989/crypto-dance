import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { hostname, pathname } = request.nextUrl;

  // Check if the subdomain is 'admin'
  if (hostname.startsWith('admin.cryptodance.app')) {
    // Redirect all requests to /admin on the main domain
    return NextResponse.redirect(new URL(`https://cryptodance.app/admin${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/*'],
};
