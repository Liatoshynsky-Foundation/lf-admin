import bcrypt from 'bcrypt';

import { LoginError } from '~/back-constants/apolloCustomErrors/adminErrors';
import { adminTypes } from '~/back-constants/index';
import { AdminRepository } from '~/domain/repositories/adminRepository';
import { zEmailSchema } from '~/validators/auth.schema';

export const loginAdmin = ({ adminRepository }: { adminRepository: AdminRepository }) => {
  return {
    execute: async (email: string, password: string): Promise<{ id: string; type: adminTypes }> => {
      const validatedEmail = zEmailSchema.parse(email);

      const admin = await adminRepository.findByEmail(validatedEmail);
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
