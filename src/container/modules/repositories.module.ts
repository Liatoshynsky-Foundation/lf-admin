import { asFunction, asValue, AwilixContainer } from 'awilix';

import { DraftPageModel } from '~/infrastructure/models/draftPage.model';
import NewsModel from '~/infrastructure/models/news.model';
import PageModel from '~/infrastructure/models/page.model';
import { AdminRepository } from '~/infrastructure/repositories/adminRepository/adminRepository';
import { newMediaMentionRepository } from '~/infrastructure/repositories/mediaMentionRepository/repository';
import { NewsRepository } from '~/infrastructure/repositories/newsRepository/newsRepository';
import { PageRepository } from '~/infrastructure/repositories/pageRepository/pageRepository';
import { RefreshTokenRepository } from '~/infrastructure/repositories/refreshTokenRepository/refreshTokenRepository';
import { MediaMentionModel } from '~/src/infrastructure/models/mediaMention.model';

export type RepositoriesModule = {
  adminRepository: ReturnType<typeof AdminRepository>;
  refreshTokenRepository: ReturnType<typeof RefreshTokenRepository>;
  pageRepository: ReturnType<typeof PageRepository>;
  newsRepository: ReturnType<typeof NewsRepository>;
  mediaMentionsRepository: ReturnType<typeof newMediaMentionRepository>;
};

export const registerRepositories = (container: AwilixContainer) => {
  container.register({
    PageModel: asValue(PageModel),
    DraftPageModel: asValue(DraftPageModel),
    NewsModel: asValue(NewsModel),
    MediaMentionsModel: asValue(MediaMentionModel),

    adminRepository: asFunction(AdminRepository).scoped(),
    refreshTokenRepository: asFunction(RefreshTokenRepository).scoped(),

    pageRepository: asFunction(PageRepository).scoped(),
    newsRepository: asFunction(NewsRepository).scoped(),
    mediaMentionsRepository: asFunction(newMediaMentionRepository).scoped()
  });
};
