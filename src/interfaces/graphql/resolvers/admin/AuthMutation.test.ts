import { GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

import { authMutation } from './AuthMutation';
import { LoginError } from '~/back-constants/apolloCustomErrors/adminErrors';
import { GraphQLContext } from '~/back-shared/types/container/types';

const mockLoginAdmin = { execute: jest.fn() };
const mockTokenService = { generateTokens: jest.fn(), verifyRefreshToken: jest.fn() };
const mockRefreshTokenService = {
  addJTI: jest.fn(),
  isExistsJTI: jest.fn(),
  deleteJTI: jest.fn(),
  deleteAllForAdmin: jest.fn()
};
const mockRequestContainer = {
  resolve: jest.fn((dependencyName: string) => {
    if (dependencyName === 'loginAdmin') return mockLoginAdmin;
    if (dependencyName === 'createTokenService') return mockTokenService;
    if (dependencyName === 'refreshTokenService') return mockRefreshTokenService;
    return undefined;
  })
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
      expect(mockRefreshTokenService.addJTI).toHaveBeenCalledWith(
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

    it('should throw an error if it is not of type LoginError', async () => {
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
      expect(mockRefreshTokenService.deleteJTI).toHaveBeenCalledWith(mockPayload.jti);
      expect(mockContext.deleteCookie).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    it('should only delete cookies if there is no token', async () => {
      const result = await authMutation.logout(null, {}, baseMockContext as GraphQLContext);
      expect(mockTokenService.verifyRefreshToken).not.toHaveBeenCalled();
      expect(mockRefreshTokenService.deleteJTI).not.toHaveBeenCalled();
      expect(baseMockContext.deleteCookie).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    it('should delete cookies even if token verification failed with an error', async () => {
      const mockContext = { ...baseMockContext, refreshTokenFromCookie: 'invalid-token' };
      mockTokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await authMutation.logout(null, {}, mockContext as GraphQLContext);

      expect(mockRefreshTokenService.deleteJTI).not.toHaveBeenCalled();
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
      mockRefreshTokenService.isExistsJTI.mockResolvedValue(true);
      mockTokenService.generateTokens.mockReturnValue(newTokens);

      const result = await authMutation.refreshToken(null, {}, mockContext as GraphQLContext);

      expect(mockRefreshTokenService.isExistsJTI).toHaveBeenCalledWith(oldPayload.jti);
      expect(mockRefreshTokenService.deleteJTI).toHaveBeenCalledWith(oldPayload.jti);
      expect(mockRefreshTokenService.addJTI).toHaveBeenCalled();
      expect(mockContext.setCookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ __typename: 'RefreshTokenPayload', success: true });
    });

    it('should delete all sessions and throw an error if the JTI is not valid', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue(oldPayload);
      mockRefreshTokenService.isExistsJTI.mockResolvedValue(false);

      await expect(authMutation.refreshToken(null, {}, mockContext as GraphQLContext)).rejects.toThrow(GraphQLError);

      expect(mockRefreshTokenService.deleteAllForAdmin).toHaveBeenCalledWith(oldPayload.id);
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
