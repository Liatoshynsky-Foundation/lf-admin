import { NextRequest } from 'next/server';

import { AdminTokenPayload } from '~/back-shared/types/tokens/types';
import { createRequestContainer } from '~/container/index';
import logger from '~/middleware/logger/logger';

export const verifyAuth = async (request: NextRequest): Promise<string | null> => {
  const requestContainer = createRequestContainer();
  const tokenService = requestContainer.resolve('createTokenService');

  const accessToken = request.cookies.get('accessToken')?.value;

  let admin: AdminTokenPayload | null = null;

  if (accessToken) {
    try {
      admin = tokenService.verifyAccessToken(accessToken);
    } catch {
      logger.warning('Access token not verified in verifyAuth');
    }
  }

  if (!admin) {
    return 'UNAUTHENTICATED';
  }

  return null;
};
