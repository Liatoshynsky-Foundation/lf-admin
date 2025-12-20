import { GraphQLError } from 'graphql/error';
import { ZodError } from 'zod';

import { LoginError } from '~/back-constants/apolloCustomErrors/adminErrors';
import { errors } from '~/back-constants/errors';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  adminTypes,
  commonCookieOptions,
  JWT_ACCESS_TOKEN_LIFETIME,
  JWT_REFRESH_TOKEN_LIFETIME,
  REFRESH_TOKEN_COOKIE_NAME
} from '~/back-constants/index';
import { LoginArgs } from '~/back-shared/types/admin/types';
import { GraphQLContext } from '~/back-shared/types/container/types';

export const authMutation = {
  login: async (_: unknown, args: LoginArgs, { requestContainer, setCookie }: GraphQLContext) => {
    const loginAdmin = requestContainer.cradle.loginAdmin;
    const createTokenService = requestContainer.cradle.createTokenService;
    const refreshTokenRepo = requestContainer.cradle.refreshTokenRepository;
    try {
      const admin = await loginAdmin.execute(args.email, args.password);
      const { accessToken, refreshToken, refreshTokenJti } = createTokenService.generateTokens(admin);

      await refreshTokenRepo.add(admin.id, refreshTokenJti, JWT_REFRESH_TOKEN_LIFETIME, admin.type);
      setCookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
        ...commonCookieOptions,
        maxAge: JWT_ACCESS_TOKEN_LIFETIME
      });

      setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        ...commonCookieOptions,
        maxAge: JWT_REFRESH_TOKEN_LIFETIME
      });

      return {
        __typename: 'LoginPayload',
        success: true,
        adminId: admin.id,
        adminType: admin.type
      };
    } catch (err) {
      if (err instanceof ZodError) {
        const firstError = err.issues[0];
        return {
          __typename: 'ErrorPayload',
          success: false,
          message: firstError?.message || 'Invalid email format',
          statusCode: 400
        };
      }
      if (err instanceof LoginError) {
        return {
          __typename: 'ErrorPayload',
          success: false,
          message: err.message,
          statusCode: 401
        };
      }
      throw err;
    }
  },
  logout: async (
    _: unknown,
    __: unknown,
    { requestContainer, refreshTokenFromCookie, deleteCookie }: GraphQLContext
  ) => {
    if (refreshTokenFromCookie) {
      const tokenService = requestContainer.cradle.createTokenService;
      const refreshTokenRepo = requestContainer.cradle.refreshTokenRepository;
      try {
        const payload = tokenService.verifyRefreshToken(refreshTokenFromCookie);
        await refreshTokenRepo.deleteByJti(payload.jti);
      } catch {}
    }

    deleteCookie(ACCESS_TOKEN_COOKIE_NAME, { path: '/' });
    deleteCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/' });
    return true;
  },
  refreshToken: async (
    _: unknown,
    __: unknown,
    { requestContainer, refreshTokenFromCookie, setCookie, deleteCookie, admin }: GraphQLContext
  ) => {
    if (!refreshTokenFromCookie) {
      throw new GraphQLError('Refresh token is missing.', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    const tokenService = requestContainer.cradle.createTokenService;
    const refreshTokenRepo = requestContainer.cradle.refreshTokenRepository;
    try {
      const oldPayload = tokenService.verifyRefreshToken(refreshTokenFromCookie);
      const isJtiValid = await refreshTokenRepo.exists(oldPayload.jti);
      if (!isJtiValid) {
        await refreshTokenRepo.deleteAllForAdmin(oldPayload.id);
        throw new Error(errors.REFRESH_TOKEN_REVOKED);
      }

      await refreshTokenRepo.deleteByJti(oldPayload.jti);

      const adminData = { id: oldPayload.id, type: admin?.type ?? 'admin' } as { id: string; type: adminTypes };
      const { accessToken, refreshToken, refreshTokenJti } = tokenService.generateTokens(adminData);

      await refreshTokenRepo.add(adminData.id, refreshTokenJti, JWT_REFRESH_TOKEN_LIFETIME, adminData.type);

      setCookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, { ...commonCookieOptions, maxAge: JWT_ACCESS_TOKEN_LIFETIME });
      setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        ...commonCookieOptions,
        maxAge: JWT_REFRESH_TOKEN_LIFETIME
      });

      return { __typename: 'RefreshTokenPayload', success: true };
    } catch {
      deleteCookie(ACCESS_TOKEN_COOKIE_NAME, { path: '/' });
      deleteCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/' });
      throw new GraphQLError('Your session has expired or is invalid. Please log in again.', {
        extensions: { code: 'UNAUTHENTICATED' }
      });
    }
  }
};
