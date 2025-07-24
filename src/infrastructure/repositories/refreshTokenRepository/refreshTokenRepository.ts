import { adminTypes } from '~/back-constants/index';
import { RefreshTokenRepository as RefreshTokenRepositoryType } from '~/domain/repositories/refreshToken';
import dbConnect from '~/infrastructure/db/connect';
import { RefreshToken } from '~/infrastructure/models/refreshToken.model';

export const RefreshTokenRepository = (): RefreshTokenRepositoryType => ({
  add: async (adminId: string, jti: string, lifeTimeSeconds: number, adminType: typeof adminTypes): Promise<void> => {
    await dbConnect();
    const expiresAt = new Date(Date.now() + lifeTimeSeconds * 1000);
    await RefreshToken.create({ adminId, jti, expiresAt, adminType });
  },
  exists: async (jti: string): Promise<boolean> => {
    await dbConnect();
    const token = await RefreshToken.findOne({ jti });
    return Boolean(token);
  },
  deleteByJti: async (jti: string): Promise<void> => {
    await dbConnect();
    await RefreshToken.deleteOne({ jti });
  },
  deleteAllForAdmin: async (adminId: string): Promise<void> => {
    await dbConnect();
    await RefreshToken.deleteMany({ adminId });
  }
});
