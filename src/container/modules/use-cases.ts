import { asFunction } from 'awilix';

import { loginAdmin } from '~/application/use-cases/loginAdmin/loginAdmin';
import { createTokenService } from '~/application/use-cases/tokenService/createToken/createToken.service';
import { refreshTokenService } from '~/application/use-cases/tokenService/refreshToken/refreshToken.service';

export const registerUseCases = () => ({
  loginAdmin: asFunction(loginAdmin).scoped(),
  createTokenService: asFunction(createTokenService).scoped(),
  refreshTokenService: asFunction(refreshTokenService).scoped()
});
