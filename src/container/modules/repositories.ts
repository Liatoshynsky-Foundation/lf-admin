import { asFunction } from 'awilix';

import { AdminRepository } from '~/infrastructure/repositories/adminRepository/adminRepository';

export const registerRepositories = () => ({
  adminRepository: asFunction(() => AdminRepository()).singleton()
});
