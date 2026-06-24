import { RateLimitRepository } from './rateLimitRepository';
import { RateLimit } from '~/infrastructure/models/rateLimit.model';

jest.mock('~/infrastructure/db/connect', () => jest.fn().mockResolvedValue(undefined));

jest.mock('~/infrastructure/models/rateLimit.model', () => ({
  RateLimit: {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
    deleteMany: jest.fn()
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

  it('checkLimit should return count if record exists', async () => {
    (RateLimit.findOne as jest.Mock).mockResolvedValue({ count: 3 });
    const count = await repository.checkLimit('test_key');
    expect(count).toBe(3);
  });

  it('checkLimit should return 0 if record does not exist', async () => {
    (RateLimit.findOne as jest.Mock).mockResolvedValue(null);
    const count = await repository.checkLimit('test_key');
    expect(count).toBe(0);
  });

  it('incrementFailure should call findOneAndUpdate', async () => {
    await repository.incrementFailure('test_key', 15);
    expect(RateLimit.findOneAndUpdate).toHaveBeenCalledWith(
      { key: 'test_key' },
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('resetAttempts should call deleteMany', async () => {
    await repository.resetAttempts('test_key');
    expect(RateLimit.deleteMany).toHaveBeenCalledWith({ key: 'test_key' });
  });
});
