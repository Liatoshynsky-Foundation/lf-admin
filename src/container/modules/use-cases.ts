import { asFunction, AwilixContainer } from 'awilix';

import { loginAdmin } from '~/application/use-cases/loginAdmin/loginAdmin';
import { newMediaMentionsService } from '~/application/use-cases/mediaMentionsService/service';
import { NewsService } from '~/application/use-cases/newsService/newsService';
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
  newsService: ReturnType<typeof NewsService>;
  mediaMentionsService: ReturnType<typeof newMediaMentionsService>;
};

export const registerUseCases = (container: AwilixContainer<UseCasesModule>) => {
  container.register({
    loginAdmin: asFunction(loginAdmin).scoped(),
    createTokenService: asFunction(createTokenService).scoped(),
    refreshTokenService: asFunction(refreshTokenService).scoped(),
    uploadService: asFunction(blobStorageService).scoped(),
    pageService: asFunction(PageService).scoped(),
    newsService: asFunction(NewsService).scoped(),
    mediaMentionsService: asFunction(newMediaMentionsService).scoped()
  });
};
