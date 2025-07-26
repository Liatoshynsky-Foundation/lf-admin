import { refreshTokenService } from './refreshToken.service';
import { adminTypes } from '~/back-constants/index';
import { RefreshTokenRepository } from '~/domain/repositories/refreshToken';

const mockRefreshTokenRepository: RefreshTokenRepository = {
  add: jest.fn(),
  exists: jest.fn(),
  deleteByJti: jest.fn(),
  deleteAllForAdmin: jest.fn()
};

beforeEach(() => {
  jest.clearAllMocks();
});

const service = refreshTokenService({
  refreshTokenRepository: mockRefreshTokenRepository
});

describe('refreshTokenService', () => {
  describe('addJTI', () => {
    it('should call refreshTokenRepository.add with the correct arguments', async () => {
      const adminId = 'admin-id-123';
      const jti = 'jti-123';
      const lifeTimeSeconds = 3600;
      const adminType: adminTypes = 'admin';

      await service.addJTI(adminId, jti, lifeTimeSeconds, adminType);

      expect(mockRefreshTokenRepository.add).toHaveBeenCalledTimes(1);
      expect(mockRefreshTokenRepository.add).toHaveBeenCalledWith(adminId, jti, lifeTimeSeconds, adminType);
    });
  });

  describe('isExistsJTI', () => {
    it('should call refreshTokenRepository.exists and return its result (true)', async () => {
      const jti = 'jti-exists';

      (mockRefreshTokenRepository.exists as jest.Mock).mockResolvedValue(true);

      const result = await service.isExistsJTI(jti);

      expect(mockRefreshTokenRepository.exists).toHaveBeenCalledTimes(1);
      expect(mockRefreshTokenRepository.exists).toHaveBeenCalledWith(jti);
      expect(result).toBe(true);
    });

    it('should call refreshTokenRepository.exists and return its result (false)', async () => {
      const jti = 'jti-not-exists';

      (mockRefreshTokenRepository.exists as jest.Mock).mockResolvedValue(false);

      const result = await service.isExistsJTI(jti);

      expect(mockRefreshTokenRepository.exists).toHaveBeenCalledWith(jti);
      expect(result).toBe(false);
    });
  });

  describe('deleteJTI', () => {
    it('should call refreshTokenRepository.deleteByJti with the correct JTI', async () => {
      const jti = 'jti-to-delete';

      await service.deleteJTI(jti);

      expect(mockRefreshTokenRepository.deleteByJti).toHaveBeenCalledTimes(1);
      expect(mockRefreshTokenRepository.deleteByJti).toHaveBeenCalledWith(jti);
    });
  });

  describe('deleteAllForAdmin', () => {
    it('should call refreshTokenRepository.deleteAllForAdmin with the correct adminId', async () => {
      const adminId = 'admin-to-logout';

      await service.deleteAllForAdmin(adminId);

      expect(mockRefreshTokenRepository.deleteAllForAdmin).toHaveBeenCalledTimes(1);
      expect(mockRefreshTokenRepository.deleteAllForAdmin).toHaveBeenCalledWith(adminId);
    });
  });
});
