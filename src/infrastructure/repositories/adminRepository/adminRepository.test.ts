import { AdminRepository } from './adminRepository';
import { Admin } from '~/infrastructure/models/admin.model';

jest.mock('../../db/connect', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../../models/admin.model', () => ({
  Admin: {
    findOne: jest.fn()
  }
}));

describe('AdminRepository', () => {
  const repo = AdminRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
