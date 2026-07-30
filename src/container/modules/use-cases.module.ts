import { asFunction, AwilixContainer } from 'awilix';

import { loginAdmin } from '~/application/use-cases/loginAdmin/loginAdmin';
import { requestPasswordReset } from '~/application/use-cases/requestPasswordReset/requestPasswordReset';
import { resetPassword } from '~/application/use-cases/resetPassword/resetPassword';
import { verifyResetToken } from '~/application/use-cases/verifyResetToken/verifyResetToken';
import { createTokenService } from '~/src/application/use-cases/tokenService/createToken.service';

export type UseCasesModule = {
  loginAdmin: ReturnType<typeof loginAdmin>;
  createTokenService: ReturnType<typeof createTokenService>;
  requestPasswordResetUseCase: ReturnType<typeof requestPasswordReset>;
  resetPasswordUseCase: ReturnType<typeof resetPassword>;
  verifyResetTokenUseCase: ReturnType<typeof verifyResetToken>;
};

export const registerUseCases = (container: AwilixContainer<UseCasesModule>) => {
  container.register({
    loginAdmin: asFunction(loginAdmin).scoped(),
    createTokenService: asFunction(createTokenService).scoped(),
    requestPasswordResetUseCase: asFunction(requestPasswordReset).singleton(),
    resetPasswordUseCase: asFunction(resetPassword).singleton(),
    verifyResetTokenUseCase: asFunction(verifyResetToken).singleton()
  });
};
