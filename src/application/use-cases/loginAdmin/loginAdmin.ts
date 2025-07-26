import bcrypt from 'bcrypt';

import { LoginError } from '~/back-constants/apolloCustomErrors/adminErrors';
import { adminTypes } from '~/back-constants/index';
import { AdminRepository } from '~/domain/repositories/adminRepository';

export const loginAdmin = ({ adminRepository }: { adminRepository: AdminRepository }) => {
  return {
    execute: async (email: string, password: string): Promise<{ id: string; type: adminTypes } | null> => {
      const admin = await adminRepository.findByEmail(email);
      if (!admin) throw new LoginError();

      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) throw new LoginError();

      return {
        id: admin.id,
        type: admin.type
      };
    }
  };
};
