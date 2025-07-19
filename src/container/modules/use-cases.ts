import { asFunction } from 'awilix';

import { loginAdmin } from '~/application/use-cases/loginAdmin';

export const registerUseCases = () => ({
  loginAdmin: asFunction(loginAdmin).scoped()
});
