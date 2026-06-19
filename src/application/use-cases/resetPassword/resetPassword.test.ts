import bcrypt from 'bcrypt';
import { ZodError } from 'zod';

import { resetPassword } from './resetPassword';

jest.mock('bcrypt');

const mockAdminRepository = {
  findByEmail: jest.fn(),
  setResetToken: jest.fn(),
  findByResetToken: jest.fn(),
  updatePasswordAndClearToken: jest.fn()
};

const useCase = resetPassword({ adminRepository: mockAdminRepository as any });

describe('resetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPassword = 'StrongPassword123!';
  const validToken = 'valid-token-123';

  it('should successfully hash new password and clear token if everything is valid', async () => {
    const futureDate = new Date(Date.now() + 3600000);
    mockAdminRepository.findByResetToken.mockResolvedValue({
      id: 'admin-123',
      resetPasswordExpires: futureDate
    });

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const result = await useCase.execute(validToken, validPassword);

    expect(mockAdminRepository.findByResetToken).toHaveBeenCalledWith(validToken);
    expect(bcrypt.hash).toHaveBeenCalledWith(validPassword, 10);
    expect(mockAdminRepository.updatePasswordAndClearToken).toHaveBeenCalledWith('admin-123', 'hashed-password');
    expect(result).toBe(true);
  });

  it('should throw Error if token is invalid or admin not found', async () => {
    mockAdminRepository.findByResetToken.mockResolvedValue(null);

    await expect(useCase.execute('invalid-token', validPassword)).rejects.toThrow(
      'Посилання для відновлення пароля вже було використано або втратило чинність'
    );
  });

  it('should throw Error if token is expired', async () => {
    const pastDate = new Date(Date.now() - 3600000);
    mockAdminRepository.findByResetToken.mockResolvedValue({
      id: 'admin-123',
      resetPasswordExpires: pastDate
    });

    await expect(useCase.execute(validToken, validPassword)).rejects.toThrow(
      'Посилання для відновлення пароля вже було використано або втратило чинність'
    );
  });

  it('should throw ZodError if password does not meet security requirements', async () => {
    await expect(useCase.execute(validToken, 'weakpass')).rejects.toThrow(ZodError);

    expect(mockAdminRepository.findByResetToken).not.toHaveBeenCalled();
  });
});
