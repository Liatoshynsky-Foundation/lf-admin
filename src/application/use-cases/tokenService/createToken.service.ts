import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { JWT_ACCESS_TOKEN_LIFETIME, JWT_REFRESH_TOKEN_LIFETIME } from '~/back-constants/index';
import { AdminTokenPayload, HasJTI, RefreshTokenPayload } from '~/back-shared/types/tokens/types';
import { getJWT } from '~/src/config';

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
      getJWT.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: JWT_ACCESS_TOKEN_LIFETIME,
        jwtid: accessTokenJti
      }
    );

    const refreshTokenPayload: RefreshTokenPayload = {
      id: admin.id
    };

    const refreshToken = jwt.sign(refreshTokenPayload, getJWT.JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: JWT_REFRESH_TOKEN_LIFETIME,
      jwtid: refreshTokenJti
    });

    return { accessToken, refreshToken, refreshTokenJti };
  },

  verifyAccessToken: (token: string): AdminTokenPayload => {
    return jwt.verify(token, getJWT.JWT_ACCESS_TOKEN_SECRET) as AdminTokenPayload;
  },

  verifyRefreshToken: (token: string): RefreshTokenPayload & HasJTI => {
    return jwt.verify(token, getJWT.JWT_REFRESH_TOKEN_SECRET) as RefreshTokenPayload & HasJTI;
  }
});
