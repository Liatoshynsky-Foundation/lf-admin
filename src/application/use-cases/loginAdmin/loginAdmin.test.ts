import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ZodError } from 'zod';

import { loginAdmin } from './loginAdmin';
import { LoginError } from '~/back-constants/apolloCustomErrors/adminErrors';
import { AdminRepository } from '~/domain/repositories/adminRepository';
import { RateLimitRepository } from '~/domain/repositories/rateLimitRepository';

jest.mock('bcrypt');

const mockAdminRepository: jest.Mocked<AdminRepository> = {
  findByEmail: jest.fn(),
  setResetToken: jest.fn(),
  findByResetToken: jest.fn(),
  updatePasswordAndClearToken: jest.fn()
};

const mockRateLimitRepository: jest.Mocked<RateLimitRepository> = {
  incrementAndCheck: jest.fn(),
  checkLimit: jest.fn(),
  incrementFailure: jest.fn(),
  resetAttempts: jest.fn()
};

const useCase = loginAdmin({
  adminRepository: mockAdminRepository,
  rateLimitRepository: mockRateLimitRepository
});

describe('loginAdmin', () => {
  const testIp = '127.0.0.1';

  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimitRepository.checkLimit.mockResolvedValue(0);
  });

  it('should return id and type if all valid and reset limits', async () => {
    const password = uuidv4();
    const fakeAdmin = {
      id: '123',
      type: 'admin' as const,
      email: 'admin@example.com',
      password: password
    };
    mockAdminRepository.findByEmail.mockResolvedValue(fakeAdmin);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute('admin@example.com', 'plainPassword', testIp);

    expect(mockAdminRepository.findByEmail).toHaveBeenCalledWith('admin@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', fakeAdmin.password);
    expect(mockRateLimitRepository.resetAttempts).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ id: '123', type: 'admin' });
  });

  it('should throw LoginError with lockout message if limit is exceeded', async () => {
    mockRateLimitRepository.checkLimit.mockResolvedValue(5);

    await expect(useCase.execute('admin@example.com', 'anyPassword', testIp)).rejects.toThrow(LoginError);
    expect(mockAdminRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('should increment failures and throw LoginError if admin not found', async () => {
    mockAdminRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute('notfound@example.com', 'anyPassword', testIp)).rejects.toThrow(LoginError);
    expect(mockRateLimitRepository.incrementFailure).toHaveBeenCalledTimes(2);
  });

  it('should increment failures and throw LoginError if incorrect password', async () => {
    const password = uuidv4();
    const fakeAdmin = {
      id: '123',
      type: 'admin' as const,
      email: 'admin@example.com',
      password: password
    };
    mockAdminRepository.findByEmail.mockResolvedValue(fakeAdmin);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute('admin@example.com', 'wrongPassword', testIp)).rejects.toThrow(LoginError);
    expect(mockRateLimitRepository.incrementFailure).toHaveBeenCalledTimes(2);
  });

  it('should throw ZodError if email is invalid', async () => {
    await expect(useCase.execute('invalid-email', 'anyPassword', testIp)).rejects.toThrow(ZodError);
  });
});
