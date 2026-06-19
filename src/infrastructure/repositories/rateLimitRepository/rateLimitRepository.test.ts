import { RateLimitRepository } from './rateLimitRepository';
import { RateLimit } from '~/infrastructure/models/rateLimit.model';

jest.mock('~/infrastructure/db/connect', () => jest.fn().mockResolvedValue(undefined));

jest.mock('~/infrastructure/models/rateLimit.model', () => ({
  RateLimit: {
    findOneAndUpdate: jest.fn()
  }
}));

describe('RateLimitRepository', () => {
  let repository: ReturnType<typeof RateLimitRepository>;

  beforeEach(() => {
    repository = RateLimitRepository();
    jest.clearAllMocks();
  });

  it('should return true if the count is less than or equal to the limit', async () => {
    const mockFind = RateLimit.findOneAndUpdate as jest.Mock;
    mockFind.mockResolvedValue({ count: 1 });

    const result = await repository.incrementAndCheck('test_key', 3, 15);
    expect(result).toBe(true);
  });

  it('should return false if the count exceeds the limit', async () => {
    const mockFind = RateLimit.findOneAndUpdate as jest.Mock;
    mockFind.mockResolvedValue({ count: 4 });

    const result = await repository.incrementAndCheck('test_key', 3, 15);
    expect(result).toBe(false);
  });
});
