import { asFunction, asValue, AwilixContainer } from 'awilix';

import { assetModel } from '~/infrastructure/models/asset.model';
import { DraftPageModel } from '~/infrastructure/models/draftPage.model';
import NewsModel from '~/infrastructure/models/news.model';
import PageModel from '~/infrastructure/models/page.model';
import { AdminRepository } from '~/infrastructure/repositories/adminRepository/adminRepository';
import { AssetRepository } from '~/infrastructure/repositories/assetRepository/assetRepository';
import { newMediaMentionRepository } from '~/infrastructure/repositories/mediaMentionRepository/repository';
import { NewsRepository } from '~/infrastructure/repositories/newsRepository/newsRepository';
import { PageRepository } from '~/infrastructure/repositories/pageRepository/pageRepository';
import { RefreshTokenRepository } from '~/infrastructure/repositories/refreshTokenRepository/refreshTokenRepository';
import { MediaMentionModel } from '~/src/infrastructure/models/mediaMention.model';

export type RepositoriesModule = {
  assetsRepository: ReturnType<typeof AssetRepository>;
  adminRepository: ReturnType<typeof AdminRepository>;
  refreshTokenRepository: ReturnType<typeof RefreshTokenRepository>;
  pageRepository: ReturnType<typeof PageRepository>;
  newsRepository: ReturnType<typeof NewsRepository>;
  mediaMentionsRepository: ReturnType<typeof newMediaMentionRepository>;
};

export const registerRepositories = (container: AwilixContainer) => {
  container.register({
    AssetModel: asValue(assetModel),
    PageModel: asValue(PageModel),
    DraftPageModel: asValue(DraftPageModel),
    NewsModel: asValue(NewsModel),
    MediaMentionsModel: asValue(MediaMentionModel),

    adminRepository: asFunction(AdminRepository).scoped(),
    refreshTokenRepository: asFunction(RefreshTokenRepository).scoped(),

    pageRepository: asFunction(PageRepository).scoped(),
    newsRepository: asFunction(NewsRepository).scoped(),
    assetsRepository: asFunction(AssetRepository).scoped(),
    mediaMentionsRepository: asFunction(newMediaMentionRepository).scoped()
  });
};
