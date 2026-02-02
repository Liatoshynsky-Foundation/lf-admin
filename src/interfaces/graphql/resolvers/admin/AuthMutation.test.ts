import { GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';
import { ZodError } from 'zod';

import { authMutation } from './AuthMutation';
import { LoginError } from '~/back-constants/apolloCustomErrors/adminErrors';
import { GraphQLContext } from '~/back-shared/types/container/types';

const mockLoginAdmin = { execute: jest.fn() };
const mockTokenService = { generateTokens: jest.fn(), verifyRefreshToken: jest.fn() };
const mockRefreshTokenRepo = {
  add: jest.fn(),
  exists: jest.fn(),
  deleteByJti: jest.fn(),
  deleteAllForAdmin: jest.fn()
};

const mockRequestContainer = {
  cradle: {
    loginAdmin: mockLoginAdmin,
    createTokenService: mockTokenService,
    refreshTokenRepository: mockRefreshTokenRepo
  }
};

const baseMockContext: Partial<GraphQLContext> = {
  requestContainer: mockRequestContainer as any,
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
  refreshTokenFromCookie: undefined,
  admin: null
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GraphQL Mutations', () => {
  describe('login', () => {
    const test = uuidv4();
    const token = uuidv4();

    const mockArgs = { email: 'test@test.com', password: test };
    const mockAdmin = { id: 'admin-1', type: 'admin' };
    const mockTokens = {
      accessToken: token,
      refreshToken: 'new-refresh-token',
      refreshTokenJti: 'new-jti'
    };

    it('should successfully log in the admin, set cookies and return LoginPayload', async () => {
      mockLoginAdmin.execute.mockResolvedValue(mockAdmin);
      mockTokenService.generateTokens.mockReturnValue(mockTokens);
      const result = await authMutation.login(null, mockArgs, baseMockContext as GraphQLContext);
      expect(mockLoginAdmin.execute).toHaveBeenCalledWith(mockArgs.email, mockArgs.password);
      expect(mockTokenService.generateTokens).toHaveBeenCalledWith(mockAdmin);
      expect(mockRefreshTokenRepo.add).toHaveBeenCalledWith(
        mockAdmin.id,
        mockTokens.refreshTokenJti,
        expect.any(Number),
        mockAdmin.type
      );
      expect(baseMockContext.setCookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        __typename: 'LoginPayload',
        success: true,
        adminId: mockAdmin.id,
        adminType: mockAdmin.type
      });
    });

    it('should return ErrorPayload if a login error occurred', async () => {
      const loginError = new LoginError();
      mockLoginAdmin.execute.mockRejectedValue(loginError);

      const result = await authMutation.login(null, mockArgs, baseMockContext as GraphQLContext);

      expect(result).toEqual({
        __typename: 'ErrorPayload',
        success: false,
        message: loginError.message,
        statusCode: 401
      });
      expect(baseMockContext.setCookie).not.toHaveBeenCalled();
    });

    it('should return ErrorPayload if email validation fails', async () => {
      const invalidEmailArgs = { email: 'invalid-email', password: test };
      const zodError = new ZodError([
        {
          code: 'custom',
          message: 'Invalid email format',
          path: ['email']
        }
      ]);
      mockLoginAdmin.execute.mockRejectedValue(zodError);

      const result = await authMutation.login(null, invalidEmailArgs, baseMockContext as GraphQLContext);

      expect(result).toEqual({
        __typename: 'ErrorPayload',
        success: false,
        message: 'Invalid email format',
        statusCode: 400
      });
      expect(baseMockContext.setCookie).not.toHaveBeenCalled();
    });

    it('should throw an error if it is not of type LoginError or ZodError', async () => {
      const genericError = new Error('Database connection failed');
      mockLoginAdmin.execute.mockRejectedValue(genericError);
      await expect(authMutation.login(null, mockArgs, baseMockContext as GraphQLContext)).rejects.toThrow(genericError);
    });
  });

  describe('logout', () => {
    it('should delete JTI and cookies if token exists', async () => {
      const mockContext = { ...baseMockContext, refreshTokenFromCookie: 'valid-refresh-token' };
      const mockPayload = { id: 'admin-1', jti: 'jti-to-delete' };
      mockTokenService.verifyRefreshToken.mockReturnValue(mockPayload);
      const result = await authMutation.logout(null, {}, mockContext as GraphQLContext);
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(mockRefreshTokenRepo.deleteByJti).toHaveBeenCalledWith(mockPayload.jti);
      expect(mockContext.deleteCookie).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    it('should only delete cookies if there is no token', async () => {
      const result = await authMutation.logout(null, {}, baseMockContext as GraphQLContext);
      expect(mockTokenService.verifyRefreshToken).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepo.deleteByJti).not.toHaveBeenCalled();
      expect(baseMockContext.deleteCookie).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    it('should delete cookies even if token verification failed with an error', async () => {
      const mockContext = { ...baseMockContext, refreshTokenFromCookie: 'invalid-token' };
      mockTokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await authMutation.logout(null, {}, mockContext as GraphQLContext);

      expect(mockRefreshTokenRepo.deleteByJti).not.toHaveBeenCalled();
      expect(mockContext.deleteCookie).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshToken', () => {
    const token = uuidv4();
    const mockContext = {
      ...baseMockContext,
      refreshTokenFromCookie: 'valid-refresh-token'
    };
    const oldPayload = { id: 'admin-1', type: 'admin', jti: 'old-jti' };
    const newTokens = {
      accessToken: token,
      refreshToken: 'new-refresh-token',
      refreshTokenJti: 'new-jti'
    };

    it('should successfully refresh tokens if the old token and JTI are valid', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue(oldPayload);
      mockRefreshTokenRepo.exists.mockResolvedValue(true);
      mockTokenService.generateTokens.mockReturnValue(newTokens);

      const result = await authMutation.refreshToken(null, {}, mockContext as GraphQLContext);

      expect(mockRefreshTokenRepo.exists).toHaveBeenCalledWith(oldPayload.jti);
      expect(mockRefreshTokenRepo.deleteByJti).toHaveBeenCalledWith(oldPayload.jti);
      expect(mockRefreshTokenRepo.add).toHaveBeenCalled();
      expect(mockContext.setCookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ __typename: 'RefreshTokenPayload', success: true });
    });

    it('should delete all sessions and throw an error if the JTI is not valid', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue(oldPayload);
      mockRefreshTokenRepo.exists.mockResolvedValue(false);

      await expect(authMutation.refreshToken(null, {}, mockContext as GraphQLContext)).rejects.toThrow(GraphQLError);

      expect(mockRefreshTokenRepo.deleteAllForAdmin).toHaveBeenCalledWith(oldPayload.id);
      expect(mockContext.deleteCookie).toHaveBeenCalledTimes(2);
      expect(mockTokenService.generateTokens).not.toHaveBeenCalled();
      expect(mockContext.setCookie).not.toHaveBeenCalled();
    });

    it('should throw an error and delete cookies if the token is expired', async () => {
      const mockContext = {
        ...baseMockContext,
        refreshTokenFromCookie: 'expired-token'
      };

      mockTokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(authMutation.refreshToken(null, {}, mockContext as GraphQLContext)).rejects.toThrow(GraphQLError);
      expect(mockContext.deleteCookie).toHaveBeenCalledTimes(2);
    });
  });
});
