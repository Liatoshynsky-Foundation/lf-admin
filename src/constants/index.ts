export type adminTypes = 'admin' | 'superadmin';
export const JWT_REFRESH_TOKEN_LIFETIME = 60 * 60 * 24;
export const JWT_ACCESS_TOKEN_LIFETIME = 60 * 5;
export const commonCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
};
export const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
