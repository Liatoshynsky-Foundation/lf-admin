import crypto from 'crypto';

import { AdminRepository } from '~/domain/repositories/adminRepository';
import { RateLimitRepository } from '~/domain/repositories/rateLimitRepository';
import { zEmailSchema } from '~/validators/auth.schema';

export const requestPasswordReset = ({
  adminRepository,
  rateLimitRepository
}: {
  adminRepository: AdminRepository;
  rateLimitRepository: RateLimitRepository;
}) => {
  return {
    execute: async (email: string, ip: string): Promise<{ token: string; email: string } | null> => {
      const validatedEmail = zEmailSchema.parse(email);

      const isIpAllowed = await rateLimitRepository.incrementAndCheck(`reset_ip:${ip}`, 10, 15);
      if (!isIpAllowed) return null;

      const isEmailAllowed = await rateLimitRepository.incrementAndCheck(`reset_email:${validatedEmail}`, 3, 15);
      if (!isEmailAllowed) return null;

      const admin = await adminRepository.findByEmail(validatedEmail);
      if (!admin) return null;

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

      await adminRepository.setResetToken(admin.id, resetToken, resetPasswordExpires);

      return {
        token: resetToken,
        email: admin.email
      };
    }
  };
};
