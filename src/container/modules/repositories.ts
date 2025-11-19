import { asFunction, asValue } from 'awilix';

import { DraftPageModel } from '~/infrastructure/models/draftPage.model';
import NewsModel from '~/infrastructure/models/news.model';
import PageModel from '~/infrastructure/models/page.model';
import { AdminRepository } from '~/infrastructure/repositories/adminRepository/adminRepository';
import { NewsRepository } from '~/infrastructure/repositories/newsRepository/newsRepository';
import { PageRepository } from '~/infrastructure/repositories/pageRepository/pageRepository';
import { RefreshTokenRepository } from '~/infrastructure/repositories/refreshTokenRepository/refreshTokenRepository';

export const registerRepositories = () => ({
  PageModel: asValue(PageModel),
  DraftPageModel: asValue(DraftPageModel),
  NewsModel: asValue(NewsModel),

  adminRepository: asFunction(() => AdminRepository()).scoped(),
  refreshTokenRepository: asFunction(() => RefreshTokenRepository()).scoped(),

  pageRepository: asFunction(({ PageModel, DraftPageModel }) => PageRepository({ PageModel, DraftPageModel })).scoped(),
  newsRepository: asFunction(NewsRepository).scoped()
});
