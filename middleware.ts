import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE_NAME } from './src/constants';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME);

  if (!authToken && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|.*\\.[^/]+$).*)'
};
