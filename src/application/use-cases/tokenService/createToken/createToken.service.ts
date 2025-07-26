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
      type: admin.type
    };

    const accessToken = jwt.sign(
      { ...accessTokenPayload, refreshJti: refreshTokenJti },
      getJWT.JWT_ACCESS_SECRET_TOKEN,
      {
        expiresIn: JWT_ACCESS_TOKEN_LIFETIME,
        jwtid: accessTokenJti
      }
    );

    const refreshTokenPayload: RefreshTokenPayload = {
      id: admin.id
    };

    const refreshToken = jwt.sign(refreshTokenPayload, getJWT.JWT_REFRESH_SECRET_TOKEN, {
      expiresIn: JWT_REFRESH_TOKEN_LIFETIME,
      jwtid: refreshTokenJti
    });

    return { accessToken, refreshToken, refreshTokenJti };
  },

  verifyAccessToken: (token: string): AdminTokenPayload => {
    return jwt.verify(token, getJWT.JWT_ACCESS_SECRET_TOKEN) as AdminTokenPayload;
  },

  verifyRefreshToken: (token: string): RefreshTokenPayload => {
    return jwt.verify(token, getJWT.JWT_REFRESH_SECRET_TOKEN) as RefreshTokenPayload;
  }
});
