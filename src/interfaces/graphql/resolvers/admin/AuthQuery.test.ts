import { authQuery } from './AuthQuery';
import { GraphQLContext } from '~/back-shared/types/container/types';

describe('authQuery', () => {
  describe('verifyResetToken', () => {
    it('should return true when the use case resolves to true', async () => {
      const mockVerifyResetTokenUseCase = {
        execute: jest.fn().mockResolvedValue(true)
      };

      const mockContext = {
        requestContainer: {
          cradle: {
            verifyResetTokenUseCase: mockVerifyResetTokenUseCase
          }
        }
      } as unknown as GraphQLContext;

      const result = await authQuery.verifyResetToken(null, { token: 'valid-token' }, mockContext);

      expect(mockVerifyResetTokenUseCase.execute).toHaveBeenCalledWith('valid-token');
      expect(result).toBe(true);
    });

    it('should return false when the use case resolves to false', async () => {
      const mockVerifyResetTokenUseCase = {
        execute: jest.fn().mockResolvedValue(false)
      };

      const mockContext = {
        requestContainer: {
          cradle: {
            verifyResetTokenUseCase: mockVerifyResetTokenUseCase
          }
        }
      } as unknown as GraphQLContext;

      const result = await authQuery.verifyResetToken(null, { token: 'invalid-or-expired-token' }, mockContext);

      expect(mockVerifyResetTokenUseCase.execute).toHaveBeenCalledWith('invalid-or-expired-token');
      expect(result).toBe(false);
    });
  });
});
