import { asFunction } from 'awilix';

import { PageService } from '~/domain/services/pageService';
import { AdminRepository } from '~/infrastructure/repositories/adminRepository/adminRepository';
import { PageRepository } from '~/infrastructure/repositories/pageRepository/pageRepository';
import { RefreshTokenRepository } from '~/infrastructure/repositories/refreshTokenRepository/refreshTokenRepository';

export const registerRepositories = () => ({
  adminRepository: asFunction(() => AdminRepository()).scoped(),
  refreshTokenRepository: asFunction(() => RefreshTokenRepository()).scoped(),
  pageRepository: asFunction(() => PageRepository()).scoped(),
  pageService: asFunction(PageService).scoped()
});
