import { verifyResetToken } from './verifyResetToken';
import { AdminRepository } from '~/domain/repositories/adminRepository';

const mockAdminRepository = {
  findByResetToken: jest.fn()
};

const useCase = verifyResetToken({ adminRepository: mockAdminRepository as unknown as AdminRepository });

describe('verifyResetToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validToken = 'test-token-123';

  it('should return true if token is valid and has not expired', async () => {
    const futureDate = new Date(Date.now() + 3600000);
    mockAdminRepository.findByResetToken.mockResolvedValue({
      id: 'admin-123',
      resetPasswordExpires: futureDate
    });

    const result = await useCase.execute(validToken);

    expect(mockAdminRepository.findByResetToken).toHaveBeenCalledWith(validToken);
    expect(result).toBe(true);
  });

  it('should return false if token is not found in the database', async () => {
    mockAdminRepository.findByResetToken.mockResolvedValue(null);

    const result = await useCase.execute('invalid-token');

    expect(mockAdminRepository.findByResetToken).toHaveBeenCalledWith('invalid-token');
    expect(result).toBe(false);
  });

  it('should return false if token is found but resetPasswordExpires is null', async () => {
    mockAdminRepository.findByResetToken.mockResolvedValue({
      id: 'admin-123',
      resetPasswordExpires: null
    });

    const result = await useCase.execute(validToken);

    expect(result).toBe(false);
  });

  it('should return false if token is expired', async () => {
    const pastDate = new Date(Date.now() - 3600000);
    mockAdminRepository.findByResetToken.mockResolvedValue({
      id: 'admin-123',
      resetPasswordExpires: pastDate
    });

    const result = await useCase.execute(validToken);

    expect(result).toBe(false);
  });
});
