import { asFunction, asValue, AwilixContainer } from 'awilix';

import { assetModel } from '~/infrastructure/models/asset.model';
import CategoryModel from '~/infrastructure/models/category.model';
import CompositionModel from '~/infrastructure/models/composition.model';
import { DraftPageModel } from '~/infrastructure/models/draftPage.model';
import EventModel from '~/infrastructure/models/event.model';
import GenreModel from '~/infrastructure/models/genre.model';
import NewsModel from '~/infrastructure/models/news.model';
import OpusModel from '~/infrastructure/models/opus.model';
import PageModel from '~/infrastructure/models/page.model';
import { RateLimit } from '~/infrastructure/models/rateLimit.model';
import { AdminRepository } from '~/infrastructure/repositories/adminRepository/adminRepository';
import { AssetRepository } from '~/infrastructure/repositories/assetRepository/assetRepository';
import { CompositionRepository } from '~/infrastructure/repositories/compositionRepository/compositionRepository';
import { EventsRepository } from '~/infrastructure/repositories/eventRepository/eventRepository';
import { MediaMentionsRepository } from '~/infrastructure/repositories/mediaMentionRepository/mediaMentionRepository';
import { NewsRepository } from '~/infrastructure/repositories/newsRepository/newsRepository';
import { OpusRepository } from '~/infrastructure/repositories/opusRepository/opusRepository';
import { PageRepository } from '~/infrastructure/repositories/pageRepository/pageRepository';
import { RateLimitRepository } from '~/infrastructure/repositories/rateLimitRepository/rateLimitRepository';
import { RefreshTokenRepository } from '~/infrastructure/repositories/refreshTokenRepository/refreshTokenRepository';
import CaseModel from '~/src/infrastructure/models/case.model';
import FundModel from '~/src/infrastructure/models/fund.model';
import { MediaMentionModel } from '~/src/infrastructure/models/mediaMention.model';
import { CaseRepository } from '~/src/infrastructure/repositories/caseRepository/caseRepository';
import { FundRepository } from '~/src/infrastructure/repositories/fundRepository/fundRepository';
import { createFundLoader } from '~/src/interfaces/graphql/resolvers/case/fundLoader';

export type RepositoriesModule = {
  assetsRepository: ReturnType<typeof AssetRepository>;
  adminRepository: ReturnType<typeof AdminRepository>;
  refreshTokenRepository: ReturnType<typeof RefreshTokenRepository>;
  pageRepository: ReturnType<typeof PageRepository>;
  newsRepository: ReturnType<typeof NewsRepository>;
  mediaMentionsRepository: ReturnType<typeof MediaMentionsRepository>;
  eventsRepository: ReturnType<typeof EventsRepository>;
  rateLimitRepository: ReturnType<typeof RateLimitRepository>;
  opusRepository: ReturnType<typeof OpusRepository>;
  compositionsRepository: ReturnType<typeof CompositionRepository>;
  fundRepository: ReturnType<typeof FundRepository>;
  caseRepository: ReturnType<typeof CaseRepository>;
  fundLoader: ReturnType<typeof createFundLoader>;
};

export const registerRepositories = (container: AwilixContainer) => {
  container.register({
    AssetModel: asValue(assetModel),
    PageModel: asValue(PageModel),
    DraftPageModel: asValue(DraftPageModel),
    NewsModel: asValue(NewsModel),
    MediaMentionsModel: asValue(MediaMentionModel),
    EventModel: asValue(EventModel),
    OpusModel: asValue(OpusModel),
    CompositionModel: asValue(CompositionModel),
    GenreModel: asValue(GenreModel),
    CategoryModel: asValue(CategoryModel),
    FundModel: asValue(FundModel),
    CaseModel: asValue(CaseModel),

    RateLimitModel: asValue(RateLimit),

    adminRepository: asFunction(AdminRepository).scoped(),
    refreshTokenRepository: asFunction(RefreshTokenRepository).scoped(),

    pageRepository: asFunction(PageRepository).scoped(),
    newsRepository: asFunction(NewsRepository).scoped(),
    mediaMentionsRepository: asFunction(MediaMentionsRepository).scoped(),
    eventsRepository: asFunction(EventsRepository).scoped(),
    opusRepository: asFunction(OpusRepository).scoped(),
    compositionsRepository: asFunction(CompositionRepository).scoped(),
    assetsRepository: asFunction(AssetRepository).scoped(),
    rateLimitRepository: asFunction(RateLimitRepository).scoped(),
    fundRepository: asFunction(FundRepository).scoped(),
    caseRepository: asFunction(CaseRepository).scoped(),
    fundLoader: asFunction(createFundLoader).scoped()
  });
};
