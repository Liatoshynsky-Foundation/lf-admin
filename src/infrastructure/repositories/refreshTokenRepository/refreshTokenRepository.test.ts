import { RefreshTokenRepository } from './refreshTokenRepository';
import { adminTypes } from '~/back-constants/index';
import dbConnect from '~/infrastructure/db/connect';
import { RefreshToken } from '~/infrastructure/models/refreshToken.model';

jest.mock('../../models/refreshToken.model', () => ({
  RefreshToken: {
    create: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn()
  }
}));

jest.mock('../../db/connect', () => ({
  __esModule: true,
  default: jest.fn()
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RefreshTokenRepository', () => {
  const repository = RefreshTokenRepository();

  describe('add', () => {
    it('should call RefreshToken.create with the correct data', async () => {
      const adminId = 'admin-1';
      const jti = 'jti-1';
      const lifeTimeSeconds = 3600;
      const adminType: adminTypes = 'admin';

      await repository.add(adminId, jti, lifeTimeSeconds, adminType);

      expect(RefreshToken.create).toHaveBeenCalledTimes(1);
      expect(RefreshToken.create).toHaveBeenCalledWith({
        adminId,
        jti,
        expiresAt: expect.any(Date),
        adminType
      });
    });
  });

  describe('exists', () => {
    it('should return true if the token is found', async () => {
      const jti = 'existing-jti';
      (RefreshToken.findOne as jest.Mock).mockResolvedValue({ jti });

      const result = await repository.exists(jti);

      expect(RefreshToken.findOne).toHaveBeenCalledWith({ jti });
      expect(result).toBe(true);
    });

    it('should return false if the token is not found', async () => {
      const jti = 'non-existing-jti';
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.exists(jti);

      expect(RefreshToken.findOne).toHaveBeenCalledWith({ jti });
      expect(result).toBe(false);
    });
  });

  describe('deleteByJti', () => {
    it('should call RefreshToken.deleteOne with the correct jti', async () => {
      const jti = 'jti-to-delete';
      await repository.deleteByJti(jti);

      expect(RefreshToken.deleteOne).toHaveBeenCalledTimes(1);
      expect(RefreshToken.deleteOne).toHaveBeenCalledWith({ jti });
    });
  });

  describe('deleteAllForAdmin', () => {
    it('should call RefreshToken.deleteMany with the correct adminId', async () => {
      const adminId = 'admin-to-delete-all';
      await repository.deleteAllForAdmin(adminId);

      expect(dbConnect).toHaveBeenCalledTimes(1);
      expect(RefreshToken.deleteMany).toHaveBeenCalledTimes(1);
      expect(RefreshToken.deleteMany).toHaveBeenCalledWith({ adminId });
    });
  });
});
