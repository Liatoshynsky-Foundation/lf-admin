import { asFunction, asValue, AwilixContainer } from 'awilix';

import { DraftPageModel } from '~/infrastructure/models/draftPage.model';
import EventModel from '~/infrastructure/models/event.model';
import PageModel from '~/infrastructure/models/page.model';
import { AdminRepository } from '~/infrastructure/repositories/adminRepository/adminRepository';
import { EventRepository } from '~/infrastructure/repositories/eventRepository/eventRepository';
import { PageRepository } from '~/infrastructure/repositories/pageRepository/pageRepository';
import { RefreshTokenRepository } from '~/infrastructure/repositories/refreshTokenRepository/refreshTokenRepository';

export type RepositoriesModule = {
  adminRepository: ReturnType<typeof AdminRepository>;
  refreshTokenRepository: ReturnType<typeof RefreshTokenRepository>;
  pageRepository: ReturnType<typeof PageRepository>;
  eventRepository: ReturnType<typeof EventRepository>;
};

export const registerRepositories = (container: AwilixContainer) => {
  container.register({
    PageModel: asValue(PageModel),
    DraftPageModel: asValue(DraftPageModel),
    EventModel: asValue(EventModel),

    adminRepository: asFunction(AdminRepository).scoped(),
    refreshTokenRepository: asFunction(RefreshTokenRepository).scoped(),

    pageRepository: asFunction(PageRepository).scoped(),
    eventRepository: asFunction(EventRepository).scoped()
  });
};
