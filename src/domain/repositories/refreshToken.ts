import { adminTypes } from '~/back-constants/index';

export interface RefreshTokenRepository {
  add(adminId: string, jti: string, lifeTimeSeconds: number, adminType: typeof adminTypes): Promise<void>;
  exists(jti: string): Promise<boolean>;
  deleteByJti(jti: string): Promise<void>;
  deleteAllForAdmin(adminId: string): Promise<void>;
}
