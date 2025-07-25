import { adminTypes } from '~/back-constants/index';
import { RefreshTokenRepository } from '~/domain/repositories/refreshToken';

export const refreshTokenService = ({
  refreshTokenRepository
}: {
  refreshTokenRepository: RefreshTokenRepository;
}) => ({
  addJTI: async (adminId: string, jti: string, lifeTimeSeconds: number, adminType: adminTypes) => {
    await refreshTokenRepository.add(adminId, jti, lifeTimeSeconds, adminType);
  },
  isExistsJTI: async (jti: string): Promise<boolean> => {
    return await refreshTokenRepository.exists(jti);
  },
  deleteJTI: async (jti: string): Promise<void> => {
    await refreshTokenRepository.deleteByJti(jti);
  },
  deleteAllForAdmin: async (adminId: string): Promise<void> => {
    await refreshTokenRepository.deleteAllForAdmin(adminId);
  }
});
