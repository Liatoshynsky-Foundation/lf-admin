import { asFunction, asValue } from 'awilix';

import { DraftPageModel } from '~/infrastructure/models/draftPage.model';
import PageModel from '~/infrastructure/models/page.model';
import { AdminRepository } from '~/infrastructure/repositories/adminRepository/adminRepository';
import { PageRepository } from '~/infrastructure/repositories/pageRepository/pageRepository';
import { RefreshTokenRepository } from '~/infrastructure/repositories/refreshTokenRepository/refreshTokenRepository';

export const registerRepositories = () => ({
  PageModel: asValue(PageModel),
  DraftPageModel: asValue(DraftPageModel),

  adminRepository: asFunction(() => AdminRepository()).scoped(),
  refreshTokenRepository: asFunction(() => RefreshTokenRepository()).scoped(),

  pageRepository: asFunction(PageRepository).scoped()
});
