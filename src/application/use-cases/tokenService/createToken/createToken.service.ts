import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { getJWT } from '../../../../config';
import { JWT_ACCESS_TOKEN_LIFETIME, JWT_REFRESH_TOKEN_LIFETIME } from '~/back-constants/index';
import { AdminTokenPayload, RefreshTokenPayload } from '~/back-shared/types/tokens/types';

export const createTokenService = () => ({
  generateTokens: (admin: { id: string; type: string }) => {
    const accessTokenJti = uuidv4();
    const refreshTokenJti = uuidv4();

    const accessTokenPayload: Omit<AdminTokenPayload, 'refreshJti'> = {
      id: admin.id,
      type: admin.type,
      jti: accessTokenJti
    };

    const accessToken = jwt.sign({ ...accessTokenPayload, refreshJti: refreshTokenJti }, getJWT.JWT_ACCESS_TOKEN, {
      expiresIn: JWT_ACCESS_TOKEN_LIFETIME
    });

    const refreshTokenPayload: RefreshTokenPayload = {
      id: admin.id,
      jti: refreshTokenJti
    };

    const refreshToken = jwt.sign(refreshTokenPayload, getJWT.JWT_REFRESH_TOKEN, {
      expiresIn: JWT_REFRESH_TOKEN_LIFETIME
    });

    return { accessToken, refreshToken, refreshTokenJti };
  },

  verifyAccessToken: (token: string): AdminTokenPayload => {
    return jwt.verify(token, getJWT.JWT_ACCESS_TOKEN) as AdminTokenPayload;
  },

  verifyRefreshToken: (token: string): RefreshTokenPayload => {
    return jwt.verify(token, getJWT.JWT_REFRESH_TOKEN) as RefreshTokenPayload;
  }
});
