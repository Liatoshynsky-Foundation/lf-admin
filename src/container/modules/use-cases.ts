import { asFunction } from 'awilix';

import { loginAdmin } from '~/application/use-cases/loginAdmin/loginAdmin';
import { NewsService } from '~/application/use-cases/newsService/newsService';
import { PageService } from '~/application/use-cases/pageService/pageService';
import { createTokenService } from '~/application/use-cases/tokenService/createToken/createToken.service';
import { refreshTokenService } from '~/application/use-cases/tokenService/refreshToken/refreshToken.service';
import { blobStorageService } from '~/application/use-cases/uploadService/upload';

export const registerUseCases = () => ({
  loginAdmin: asFunction(loginAdmin).scoped(),
  createTokenService: asFunction(createTokenService).scoped(),
  refreshTokenService: asFunction(refreshTokenService).scoped(),
  uploadService: asFunction(blobStorageService).scoped(),
  pageService: asFunction(PageService).scoped(),
  newsService: asFunction(NewsService).scoped()
});
