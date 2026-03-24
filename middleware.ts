import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';
import { REFRESH_TOKEN_COOKIE_NAME } from './src/constants';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  if (!refreshToken && pathname !== '/login' && !pathname.startsWith('/en/login') && !pathname.startsWith('/uk/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|.*\\.[^/]+$).*)'
};
