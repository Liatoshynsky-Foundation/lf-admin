import { Mutation } from './Mutation';
import { LoginError } from '~/back-constants/customErrors/adminErrors';

describe('Mutation', () => {
  describe('login', () => {
    const fakeArgs = { email: 'admin@example.com', password: 'password123' }; //NOSONAR
    const fakeAdmin = { id: '123', type: 'superadmin' };

    const mockExecute = jest.fn();

    const context = {
      container: {
        resolve: jest.fn(() => ({
          execute: mockExecute
        }))
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return success payload if login is successful', async () => {
      mockExecute.mockResolvedValue(fakeAdmin);

      const result = await Mutation.login({}, fakeArgs, context as any);

      expect(context.container.resolve).toHaveBeenCalledWith('loginAdmin');
      expect(mockExecute).toHaveBeenCalledWith(fakeArgs.email, fakeArgs.password);

      expect(result).toEqual({
        __typename: 'LoginPayload',
        success: true,
        adminId: fakeAdmin.id,
        adminType: fakeAdmin.type
      });
    });

    it('should return error payload if LoginError is thrown', async () => {
      mockExecute.mockRejectedValue(new LoginError());

      const result = await Mutation.login({}, fakeArgs, context as any);

      expect(result).toEqual({
        __typename: 'ErrorPayload',
        success: false,
        message: 'Неправильний логін або пароль',
        statusCode: 401
      });
    });

    it('should rethrow unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected');
      mockExecute.mockRejectedValue(unexpectedError);

      await expect(Mutation.login({}, fakeArgs, context as any)).rejects.toThrow('Unexpected');
    });
  });
});
