import { asFunction, AwilixContainer } from 'awilix';

import { EventService } from '~/application/use-cases/eventService/eventService';
import { loginAdmin } from '~/application/use-cases/loginAdmin/loginAdmin';
import { PageService } from '~/application/use-cases/pageService/pageService';
import { createTokenService } from '~/application/use-cases/tokenService/createToken/createToken.service';
import { refreshTokenService } from '~/application/use-cases/tokenService/refreshToken/refreshToken.service';
import { blobStorageService } from '~/application/use-cases/uploadService/upload';

export type UseCasesModule = {
  loginAdmin: ReturnType<typeof loginAdmin>;
  createTokenService: ReturnType<typeof createTokenService>;
  refreshTokenService: ReturnType<typeof refreshTokenService>;
  uploadService: ReturnType<typeof blobStorageService>;
  pageService: ReturnType<typeof PageService>;
  eventService: ReturnType<typeof EventService>;
};

export const registerUseCases = (container: AwilixContainer<UseCasesModule>) => {
  container.register({
    loginAdmin: asFunction(loginAdmin).scoped(),
    createTokenService: asFunction(createTokenService).scoped(),
    refreshTokenService: asFunction(refreshTokenService).scoped(),
    uploadService: asFunction(blobStorageService).scoped(),
    pageService: asFunction(PageService).scoped(),
    eventService: asFunction(EventService).scoped()
  });
};
