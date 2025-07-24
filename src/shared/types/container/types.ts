import { AwilixContainer } from 'awilix';
import { CookieSerializeOptions } from 'cookie';

import { AdminTokenPayload } from '~/back-shared/types/tokens/types';

export interface CookieToAction {
  action: 'set' | 'delete';
  name: string;
  value?: string;
  options?: CookieSerializeOptions;
}

export interface GraphQLContext {
  requestContainer: AwilixContainer;
  admin: AdminTokenPayload | null;
  refreshTokenFromCookie?: string;
  cookieActions: CookieToAction[];
  setCookie: (name: string, value: string, options?: CookieSerializeOptions) => void;
  deleteCookie: (name: string, options?: CookieSerializeOptions) => void;
}
