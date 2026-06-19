import { AdminRepository } from '~/domain/repositories/adminRepository';

export const verifyResetToken = ({ adminRepository }: { adminRepository: AdminRepository }) => {
  return {
    execute: async (token: string): Promise<boolean> => {
      const admin = await adminRepository.findByResetToken(token);

      if (!admin?.resetPasswordExpires) {
        return false;
      }

      return admin.resetPasswordExpires.getTime() > Date.now();
    }
  };
};
