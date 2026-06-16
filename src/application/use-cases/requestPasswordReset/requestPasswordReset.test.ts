import crypto from 'crypto';
import { ZodError } from 'zod';

import { requestPasswordReset } from './requestPasswordReset';
import { AdminRepository } from '~/domain/repositories/adminRepository';
import { RateLimitRepository } from '~/domain/repositories/rateLimitRepository';

jest.mock('crypto', () => ({
  randomBytes: jest.fn()
}));

const mockAdminRepository = {
  findByEmail: jest.fn(),
  setResetToken: jest.fn()
};

const mockRateLimitRepository = {
  incrementAndCheck: jest.fn()
};

const useCase = requestPasswordReset({
  adminRepository: mockAdminRepository as unknown as AdminRepository,
  rateLimitRepository: mockRateLimitRepository as unknown as RateLimitRepository
});

describe('requestPasswordReset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimitRepository.incrementAndCheck.mockResolvedValue(true);
  });

  const testIp = '192.168.1.1';

  it('should generate token, save it to DB, and return token data if admin exists', async () => {
    const fakeAdmin = { id: 'admin-123', email: 'admin@example.com' };
    mockAdminRepository.findByEmail.mockResolvedValue(fakeAdmin);

    const mockBuffer = Buffer.from('mock-token-string');
    (crypto.randomBytes as jest.Mock).mockReturnValue(mockBuffer);
    const expectedHexToken = mockBuffer.toString('hex');

    const result = await useCase.execute('admin@example.com', testIp);

    expect(mockRateLimitRepository.incrementAndCheck).toHaveBeenCalledWith(`reset_ip:${testIp}`, 10, 15);
    expect(mockRateLimitRepository.incrementAndCheck).toHaveBeenCalledWith('reset_email:admin@example.com', 3, 15);
    expect(mockAdminRepository.findByEmail).toHaveBeenCalledWith('admin@example.com');
    expect(mockAdminRepository.setResetToken).toHaveBeenCalledWith('admin-123', expectedHexToken, expect.any(Date));

    expect(result).toEqual({
      token: expectedHexToken,
      email: 'admin@example.com'
    });
  });

  it('should return null if IP rate limit is exceeded', async () => {
    mockRateLimitRepository.incrementAndCheck.mockResolvedValueOnce(false);

    const result = await useCase.execute('admin@example.com', testIp);

    expect(mockRateLimitRepository.incrementAndCheck).toHaveBeenCalledWith(`reset_ip:${testIp}`, 10, 15);
    expect(mockAdminRepository.findByEmail).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return null if Email rate limit is exceeded', async () => {
    mockRateLimitRepository.incrementAndCheck.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const result = await useCase.execute('admin@example.com', testIp);

    expect(mockAdminRepository.findByEmail).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return null and not save token if admin is not found', async () => {
    mockAdminRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute('unknown@example.com', testIp);

    expect(mockAdminRepository.findByEmail).toHaveBeenCalledWith('unknown@example.com');
    expect(mockAdminRepository.setResetToken).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should throw ZodError if email is invalid', async () => {
    await expect(useCase.execute('invalid-email-format', testIp)).rejects.toThrow(ZodError);
    expect(mockAdminRepository.findByEmail).not.toHaveBeenCalled();
  });
});
