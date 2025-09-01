import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { REFRESH_TOKEN_COOKIE_NAME } from './src/constants';

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME);

  if (false && !refreshToken && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|.*\\.[^/]+$).*)'
};
