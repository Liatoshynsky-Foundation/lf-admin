import { asFunction, AwilixContainer } from 'awilix';

import { loginAdmin } from '~/application/use-cases/loginAdmin/loginAdmin';
import { blobStorageService } from '~/application/use-cases/uploadService/upload';
import { createTokenService } from '~/src/application/use-cases/tokenService/createToken.service';

export type UseCasesModule = {
  loginAdmin: ReturnType<typeof loginAdmin>;
  createTokenService: ReturnType<typeof createTokenService>;
  uploadService: ReturnType<typeof blobStorageService>;
};

export const registerUseCases = (container: AwilixContainer<UseCasesModule>) => {
  container.register({
    loginAdmin: asFunction(loginAdmin).scoped(),
    createTokenService: asFunction(createTokenService).scoped(),
    uploadService: asFunction(blobStorageService).scoped()
  });
};
