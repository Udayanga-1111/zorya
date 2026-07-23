import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/pages/login') || request.nextUrl.pathname.startsWith('/pages/signup');

  // If trying to access a protected page (any page under /pages except login/signup)
  if (!token && !isAuthPage && request.nextUrl.pathname.startsWith('/pages/')) {
    return NextResponse.redirect(new URL('/pages/login', request.url));
  }

  // If already logged in and trying to access auth pages, redirect to dashboard? 
  // Let's keep it simple for now as requested.

  return NextResponse.next();
}

export const config = {
  matcher: ['/pages/:path*'],
};
