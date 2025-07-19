import { asFunction } from 'awilix';

import { AdminRepository } from '~/infrastructure/repositories/admin.repository';

export const registerRepositories = () => ({
  adminRepository: asFunction(() => AdminRepository()).singleton()
});
