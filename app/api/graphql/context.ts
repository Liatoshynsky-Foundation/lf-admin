import { SerializeOptions } from 'cookie';
import { NextRequest } from 'next/server';

import { CookieToAction, GraphQLContext } from '~/back-shared/types/container/types';
import { AdminTokenPayload } from '~/back-shared/types/tokens/types';
import { createRequestContainer } from '~/container/index';
import logger from '~/middleware/logger/logger';

export const createGraphQLContext = async (req: NextRequest): Promise<Omit<GraphQLContext, 'container'>> => {
  const requestContainer = createRequestContainer();
  const tokenService = requestContainer.resolve('createTokenService');

  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  let admin: AdminTokenPayload | null = null;

  if (accessToken) {
    try {
      admin = tokenService.verifyAccessToken(accessToken);
    } catch {
      logger.warn('Access token not verified. Need to refresh it');
    }
  }

  const cookieActions: CookieToAction[] = [];
  const setCookie = (name: string, value: string, options: SerializeOptions = {}) => {
    cookieActions.push({ action: 'set', name, value, options });
  };
  const deleteCookie = (name: string, options: SerializeOptions = {}) => {
    cookieActions.push({ action: 'delete', name, options });
  };

  return {
    requestContainer,
    admin,
    refreshTokenFromCookie: refreshToken,
    cookieActions,
    setCookie,
    deleteCookie
  };
};
