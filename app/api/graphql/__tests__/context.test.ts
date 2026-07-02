type TokenServiceMock = {
  verifyAccessToken: jest.Mock;
};

type MockCookies = {
  get: (name: string) => { value: string } | undefined;
};

type MockRequest = {
  cookies: MockCookies;
};

type ContextModule = {
  createGraphQLContext: (req: MockRequest) => Promise<{
    admin: { id: string } | null;
    cookieActions: unknown[];
    refreshTokenFromCookie?: string;
    setCookie: (name: string, value: string, options?: Record<string, unknown>) => void;
    deleteCookie: (name: string, options?: Record<string, unknown>) => void;
  }>;
};

type LoggerModule = {
  warn: jest.Mock;
};

describe('createGraphQLContext', () => {
  let tokenServiceMock: TokenServiceMock;

  beforeEach(() => {
    jest.resetModules();
    tokenServiceMock = { verifyAccessToken: jest.fn().mockReturnValue({ id: 'admin' }) };
    jest.doMock('../../../../src/container/index', () => ({
      createRequestContainer: () => ({ resolve: () => tokenServiceMock })
    }));
    jest.doMock('../../../../src/middleware/logger/logger', () => ({ warn: jest.fn() }));
  });

  it('returns admin when access token is valid and supports cookie actions', async () => {
    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { createGraphQLContext } = require('../context') as ContextModule;
    const req: MockRequest = { cookies: { get: () => ({ value: 'tok' }) } };

    const ctx = await createGraphQLContext(req);

    expect(ctx.admin).toEqual({ id: 'admin' });
    expect(Array.isArray(ctx.cookieActions)).toBe(true);

    ctx.setCookie('a', 'b', { httpOnly: true });
    ctx.setCookie('x', 'y');
    ctx.deleteCookie('c');
    ctx.deleteCookie('d', { path: '/' });

    expect(ctx.cookieActions).toEqual([
      { action: 'set', name: 'a', value: 'b', options: { httpOnly: true } },
      { action: 'set', name: 'x', value: 'y', options: {} },
      { action: 'delete', name: 'c', options: {} },
      { action: 'delete', name: 'd', options: { path: '/' } }
    ]);
  });

  it('handles invalid access token and logs a warning', async () => {
    tokenServiceMock.verifyAccessToken = jest.fn(() => {
      throw new Error('bad');
    });
    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const logger = require('../../../../src/middleware/logger/logger') as LoggerModule;
    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { createGraphQLContext } = require('../context') as ContextModule;
    const req: MockRequest = { cookies: { get: () => ({ value: 'tok' }) } };

    const ctx = await createGraphQLContext(req);

    expect(ctx.admin).toBeNull();
    expect(logger.warn).toHaveBeenCalled();
  });

  it('returns null admin when no access token provided', async () => {
    const tokenServiceMock2: TokenServiceMock = { verifyAccessToken: jest.fn() };
    jest.resetModules();
    jest.doMock('../../../../src/container/index', () => ({
      createRequestContainer: () => ({ resolve: () => tokenServiceMock2 })
    }));
    jest.doMock('../../../../src/middleware/logger/logger', () => ({ warn: jest.fn() }));

    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { createGraphQLContext } = require('../context') as ContextModule;
    const req: MockRequest = { cookies: { get: () => undefined } };

    const ctx = await createGraphQLContext(req);

    expect(ctx.admin).toBeNull();
    expect(ctx.refreshTokenFromCookie).toBeUndefined();
  });

  it('returns refresh token when refreshToken is present and access token missing', async () => {
    const tokenServiceMock2: TokenServiceMock = { verifyAccessToken: jest.fn() };
    jest.resetModules();
    jest.doMock('../../../../src/container/index', () => ({
      createRequestContainer: () => ({ resolve: () => tokenServiceMock2 })
    }));
    jest.doMock('../../../../src/middleware/logger/logger', () => ({ warn: jest.fn() }));

    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { createGraphQLContext } = require('../context') as ContextModule;
    const req: MockRequest = {
      cookies: { get: (name: string) => (name === 'refreshToken' ? { value: 'refresh' } : undefined) }
    };

    const ctx = await createGraphQLContext(req);

    expect(ctx.admin).toBeNull();
    expect(ctx.refreshTokenFromCookie).toBe('refresh');
  });
});

export {};
