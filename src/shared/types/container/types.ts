import { SerializeOptions } from 'cookie';

import { AdminTokenPayload } from '~/back-shared/types/tokens/types';
import { AwilixContainerType } from '~/container/index';

export interface CookieToAction {
  action: 'set' | 'delete';
  name: string;
  value?: string;
  options?: SerializeOptions;
}

export interface GraphQLContext {
  requestContainer: AwilixContainerType;
  admin: AdminTokenPayload | null;
  refreshTokenFromCookie?: string;
  cookieActions: CookieToAction[];
  setCookie: (name: string, value: string, options?: SerializeOptions) => void;
  deleteCookie: (name: string, options?: SerializeOptions) => void;
}
