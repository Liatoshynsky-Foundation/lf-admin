import bcrypt from 'bcrypt';

import { AdminRepository } from '~/domain/repositories/adminRepository';
import { zPasswordSchema } from '~/validators/auth.schema';

export const resetPassword = ({ adminRepository }: { adminRepository: AdminRepository }) => {
  return {
    execute: async (token: string, newPassword: string): Promise<boolean> => {
      zPasswordSchema.parse(newPassword);

      const admin = await adminRepository.findByResetToken(token);

      if (!admin?.resetPasswordExpires || admin.resetPasswordExpires.getTime() < Date.now()) {
        throw new Error(
          'Посилання для відновлення пароля вже було використано або втратило чинність. Будь ласка, створіть новий запит на відновлення пароля.'
        );
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await adminRepository.updatePasswordAndClearToken(admin.id, hashedPassword);

      return true;
    }
  };
};
