import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { REFRESH_TOKEN_COOKIE_NAME } from './src/constants';

const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  if (!refreshToken && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|.*\\.[^/]+$).*)'
};
