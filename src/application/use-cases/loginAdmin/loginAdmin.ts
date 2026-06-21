import bcrypt from 'bcrypt';

import { LoginError } from '~/back-constants/apolloCustomErrors/adminErrors';
import { errors } from '~/back-constants/errors';
import { adminTypes } from '~/back-constants/index';
import { AdminRepository } from '~/domain/repositories/adminRepository';
import { RateLimitRepository } from '~/src/domain/repositories/rateLimitRepository';
import { zEmailSchema } from '~/validators/auth.schema';

const LOCKOUT_MESSAGE = 'Забагато невдалих спроб входу. Спробуйте ще раз через 15 хвилин.';

export const loginAdmin = ({
  adminRepository,
  rateLimitRepository
}: {
  adminRepository: AdminRepository;
  rateLimitRepository: RateLimitRepository;
}) => {
  return {
    execute: async (email: string, password: string, ip: string): Promise<{ id: string; type: adminTypes }> => {
      const validatedEmail = zEmailSchema.parse(email);

      const maxFailedAttempts = Number(process.env.LOGIN_MAX_FAILED_ATTEMPTS) || 5;
      const blockDurationMinutes = Number(process.env.LOGIN_BLOCK_DURATION_MINUTES) || 15;

      const ipKey = `login_fail_ip:${ip}`;
      const emailKey = `login_fail_email:${validatedEmail}`;

      const ipAttempts = await rateLimitRepository.checkLimit(ipKey);
      const emailAttempts = await rateLimitRepository.checkLimit(emailKey);

      if (ipAttempts >= maxFailedAttempts || emailAttempts >= maxFailedAttempts) {
        throw new LoginError(LOCKOUT_MESSAGE);
      }

      const recordFailure = async () => {
        await rateLimitRepository.incrementFailure(ipKey, blockDurationMinutes);
        await rateLimitRepository.incrementFailure(emailKey, blockDurationMinutes);
      };

      const admin = await adminRepository.findByEmail(validatedEmail);
      if (!admin) {
        await recordFailure();
        throw new LoginError(errors.WRONG_EMAIL);
      }

      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) {
        await recordFailure();
        throw new LoginError(errors.WRONG_PASS);
      }

      await rateLimitRepository.resetAttempts(ipKey);
      await rateLimitRepository.resetAttempts(emailKey);

      return {
        id: admin.id,
        type: admin.type
      };
    }
  };
};
