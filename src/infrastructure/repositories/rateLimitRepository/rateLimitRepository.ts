import { RateLimit } from '../../models/rateLimit.model';
import type { RateLimitRepository as RateLimitRepositoryType } from '~/domain/repositories/rateLimitRepository';
import dbConnect from '~/infrastructure/db/connect';

export const RateLimitRepository = (): RateLimitRepositoryType => ({
  incrementAndCheck: async (key: string, limit: number, windowMinutes: number) => {
    await dbConnect();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + windowMinutes * 60 * 1000);

    const record = await RateLimit.findOneAndUpdate(
      { key },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return record.count <= limit;
  }
});
