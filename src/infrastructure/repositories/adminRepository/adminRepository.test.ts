import { AdminRepository } from './adminRepository';
import { Admin } from '~/infrastructure/models/admin.model';

jest.mock('../../db/connect', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../../models/admin.model', () => ({
  Admin: {
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn()
  }
}));

describe('AdminRepository', () => {
  const repo = AdminRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return admin if exist', async () => {
      const mockAdmin = { id: '123', email: 'admin@example.com' };
      (Admin.findOne as jest.Mock).mockResolvedValue(mockAdmin);
      const result = await repo.findByEmail('admin@example.com');
      expect(result).toEqual(mockAdmin);
    });

    it('should return null if admin not exist', async () => {
      (Admin.findOne as jest.Mock).mockResolvedValue(null);
      const result = await repo.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('setResetToken', () => {
    it('should update admin with reset password token and expiry date', async () => {
      const adminId = '123';
      const token = 'reset-token-123';
      const expires = new Date('2026-12-31T23:59:59.000Z');

      await repo.setResetToken(adminId, token, expires);

      expect(Admin.findByIdAndUpdate).toHaveBeenCalledWith(adminId, {
        resetPasswordToken: token,
        resetPasswordExpires: expires
      });
    });
  });

  describe('findByResetToken', () => {
    it('should return admin by reset token', async () => {
      const mockAdmin = { id: '123', resetPasswordToken: 'valid-token' };
      (Admin.findOne as jest.Mock).mockResolvedValue(mockAdmin);

      const result = await repo.findByResetToken('valid-token');

      expect(Admin.findOne).toHaveBeenCalledWith({ resetPasswordToken: 'valid-token' });
      expect(result).toEqual(mockAdmin);
    });
  });

  describe('updatePasswordAndClearToken', () => {
    it('should update password and clear reset token and expiry', async () => {
      const adminId = '123';
      const hashedPassword = 'new-hashed-password';

      await repo.updatePasswordAndClearToken(adminId, hashedPassword);

      expect(Admin.findByIdAndUpdate).toHaveBeenCalledWith(adminId, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
    });
  });
});
