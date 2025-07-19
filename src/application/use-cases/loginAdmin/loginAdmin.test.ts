import bcrypt from 'bcrypt';

import { loginAdmin } from './loginAdmin';
import { LoginError } from '~/back-constants/customErrors/adminErrors';

jest.mock('bcrypt');

const mockAdminRepository = {
  findByEmail: jest.fn()
};

const useCase = loginAdmin({ adminRepository: mockAdminRepository });

describe('loginAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return id and type if all valid', async () => {
    const fakeAdmin = { id: '123', type: 'admin', password: 'hashedPassword' };
    mockAdminRepository.findByEmail.mockResolvedValue(fakeAdmin);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute('admin@example.com', 'plainPassword');

    expect(mockAdminRepository.findByEmail).toHaveBeenCalledWith('admin@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', fakeAdmin.password);
    expect(result).toEqual({ id: '123', type: 'admin' });
  });

  it('should throw LoginError if admin not found', async () => {
    mockAdminRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute('notfound@example.com', 'anyPassword')).rejects.toThrow(LoginError);
  });

  it('should throw LoginError if incorrect password', async () => {
    const fakeAdmin = { id: '123', type: 'admin', password: 'hashedPassword' };
    mockAdminRepository.findByEmail.mockResolvedValue(fakeAdmin);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute('admin@example.com', 'wrongPassword')).rejects.toThrow(LoginError);
  });
});
