import jwt from 'jsonwebtoken';

import { getJWT } from '../../../../config';
import { createTokenService } from './createToken.service';
import { AdminTokenPayload, RefreshTokenPayload } from '~/back-shared/types/tokens/types';

jest.mock('../../../../config', () => ({
  getJWT: {
    JWT_ACCESS_TOKEN: 'test-access-secret-from-mock',
    JWT_REFRESH_TOKEN: 'test-refresh-secret-from-mock'
  }
}));

describe('createTokenService', () => {
  const tokenService = createTokenService();
  const mockAdmin = {
    id: 'admin-id-123',
    type: 'super-admin'
  };

  describe('generateTokens', () => {
    it('should generate valid accessToken and refreshToken', () => {
      const { accessToken, refreshToken } = tokenService.generateTokens(mockAdmin);

      expect(accessToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
    });

    it('should include the correct payload and bind tokens via jti', () => {
      const { accessToken, refreshToken, refreshTokenJti } = tokenService.generateTokens(mockAdmin);

      const decodedAccess = jwt.verify(accessToken, getJWT.JWT_ACCESS_TOKEN) as AdminTokenPayload;
      const decodedRefresh = jwt.verify(refreshToken, getJWT.JWT_REFRESH_TOKEN) as RefreshTokenPayload;

      expect(decodedAccess.id).toBe(mockAdmin.id);
      expect(decodedAccess.type).toBe(mockAdmin.type);
      expect(decodedAccess.jti).toBeDefined();
      expect(decodedAccess.refreshJti).toBeDefined();

      expect(decodedRefresh.id).toBe(mockAdmin.id);
      expect(decodedRefresh.jti).toBeDefined();

      expect(decodedAccess.refreshJti).toBe(decodedRefresh.jti);
      expect(refreshTokenJti).toBe(decodedRefresh.jti);
    });
  });

  describe('verifyAccessToken', () => {
    it('should successfully verify a valid access token', () => {
      const { accessToken } = tokenService.generateTokens(mockAdmin);
      const payload = tokenService.verifyAccessToken(accessToken);

      expect(payload.id).toBe(mockAdmin.id);
      expect(payload.type).toBe(mockAdmin.type);
      expect(payload.jti).toBeDefined();
    });

    it('should throw an error for a token signed with an invalid key', () => {
      const maliciousToken = jwt.sign({ id: 'hacker' }, 'this-is-a-wrong-secret');

      expect(() => {
        tokenService.verifyAccessToken(maliciousToken);
      }).toThrow(jwt.JsonWebTokenError);
    });

    it('should throw an error for an expired access token', () => {
      jest.useFakeTimers();

      const { accessToken } = tokenService.generateTokens(mockAdmin);

      jest.advanceTimersByTime(16 * 60 * 1000);

      expect(() => {
        tokenService.verifyAccessToken(accessToken);
      }).toThrow(jwt.TokenExpiredError);

      jest.useRealTimers();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should successfully verify a valid refresh token', () => {
      const { refreshToken } = tokenService.generateTokens(mockAdmin);
      const payload = tokenService.verifyRefreshToken(refreshToken);

      expect(payload.id).toBe(mockAdmin.id);
      expect(payload.jti).toBeDefined();
    });

    it('should throw an error for a token signed with an invalid key', () => {
      const maliciousToken = jwt.sign({ id: 'hacker' }, 'this-is-a-wrong-secret');

      expect(() => {
        tokenService.verifyRefreshToken(maliciousToken);
      }).toThrow(jwt.JsonWebTokenError);
    });

    it('should throw an error for an expired refresh token', () => {
      jest.useFakeTimers();

      const { refreshToken } = tokenService.generateTokens(mockAdmin);

      jest.advanceTimersByTime(8 * 24 * 60 * 60 * 1000);

      expect(() => {
        tokenService.verifyRefreshToken(refreshToken);
      }).toThrow(jwt.TokenExpiredError);

      jest.useRealTimers();
    });
  });
});
