import { GraphQLError } from 'graphql/error';

import { LoginError } from '~/back-constants/apolloCustomErrors/adminErrors';
import { errors } from '~/back-constants/errors';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  commonCookieOptions,
  JWT_ACCESS_TOKEN_LIFETIME,
  JWT_REFRESH_TOKEN_LIFETIME,
  REFRESH_TOKEN_COOKIE_NAME
} from '~/back-constants/index';
import { LoginArgs } from '~/back-shared/types/admin/types';
import { GraphQLContext } from '~/back-shared/types/container/types';

export const Mutation = {
  login: async (_: unknown, args: LoginArgs, context: GraphQLContext) => {
    const loginAdmin = context.requestContainer.resolve('loginAdmin');
    const createTokenService = context.requestContainer.resolve('createTokenService');
    const refreshTokenService = context.requestContainer.resolve('refreshTokenService');
    try {
      const admin = await loginAdmin.execute(args.email, args.password);
      const { accessToken, refreshToken, refreshTokenJti } = createTokenService.generateTokens(admin);
      await refreshTokenService.addJTI(admin.id, refreshTokenJti, JWT_REFRESH_TOKEN_LIFETIME, admin.type);
      context.setCookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
        ...commonCookieOptions,
        maxAge: JWT_ACCESS_TOKEN_LIFETIME
      });

      context.setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
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
  logout: async (_: unknown, __: unknown, context: GraphQLContext) => {
    const { requestContainer, refreshTokenFromCookie, deleteCookie } = context;

    if (refreshTokenFromCookie) {
      const tokenService = requestContainer.resolve('createTokenService');
      const refreshTokenService = requestContainer.resolve('refreshTokenService');
      try {
        const payload = tokenService.verifyRefreshToken(refreshTokenFromCookie);
        await refreshTokenService.deleteJTI(payload.jti);
      } catch {}
    }

    deleteCookie(ACCESS_TOKEN_COOKIE_NAME, { path: '/' });
    deleteCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/' });
    return true;
  },
  refreshToken: async (_: unknown, __: unknown, context: GraphQLContext) => {
    const { requestContainer, refreshTokenFromCookie, setCookie, deleteCookie, admin } = context;

    if (!refreshTokenFromCookie) {
      throw new GraphQLError('Refresh token is missing.', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    const tokenService = requestContainer.resolve('createTokenService');
    const refreshTokenService = requestContainer.resolve('refreshTokenService');
    try {
      const oldPayload = tokenService.verifyRefreshToken(refreshTokenFromCookie);
      const isJtiValid = await refreshTokenService.isExistsJTI(oldPayload.jti);
      if (!isJtiValid) {
        await refreshTokenService.deleteAllForAdmin(oldPayload.id);
        throw new Error(errors.REFRESH_TOKEN_REVOKED);
      }

      await refreshTokenService.deleteJTI(oldPayload.jti);

      const adminData = { id: oldPayload.id, type: admin?.type ?? 'admin' };
      const { accessToken, refreshToken, refreshTokenJti } = tokenService.generateTokens(adminData);

      await refreshTokenService.addJTI(adminData.id, refreshTokenJti, JWT_REFRESH_TOKEN_LIFETIME, adminData.type);

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
