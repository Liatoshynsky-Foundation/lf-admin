import 'whatwg-fetch';
import type { NextRequest } from 'next/server';

import { GET } from './route';

const verifyAccessTokenMock = jest.fn();

jest.mock('next/server', () => ({
  __esModule: true,
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => new Response(JSON.stringify(body), init)
  }
}));

jest.mock('~/src/application/use-cases/tokenService/createToken.service', () => ({
  __esModule: true,
  createTokenService: () => ({
    verifyAccessToken: verifyAccessTokenMock
  })
}));

const buildRequest = (cookies: Record<string, string> = {}): NextRequest =>
  ({
    cookies: {
      get: (name: string) => (name in cookies ? { name, value: cookies[name] } : undefined)
    }
  }) as unknown as NextRequest;

describe('GET /api/preview-proxy', () => {
  const originalPreviewSecret = process.env.PREVIEW_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PREVIEW_SECRET = 'test-preview-secret';
  });

  afterAll(() => {
    process.env.PREVIEW_SECRET = originalPreviewSecret;
  });

  it('returns 401 when access token cookie is missing', async () => {
    const response = await GET(buildRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: 'Unauthorized' });
  });

  it('returns 401 when access token is invalid', async () => {
    verifyAccessTokenMock.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const response = await GET(buildRequest({ accessToken: 'bad-token' }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: 'Unauthorized' });
  });

  it('returns 403 when user is not admin or superadmin', async () => {
    verifyAccessTokenMock.mockReturnValue({ id: '1', type: 'user' });

    const response = await GET(buildRequest({ accessToken: 'valid-token' }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ message: 'Forbidden' });
  });

  it('returns 500 when PREVIEW_SECRET is not configured', async () => {
    verifyAccessTokenMock.mockReturnValue({ id: '1', type: 'admin' });
    delete process.env.PREVIEW_SECRET;

    const response = await GET(buildRequest({ accessToken: 'valid-token' }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ message: 'Preview secret is not configured' });
  });

  it('returns preview secret for authorized admin', async () => {
    verifyAccessTokenMock.mockReturnValue({ id: '1', type: 'admin' });

    const response = await GET(buildRequest({ accessToken: 'valid-token' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ previewSecret: 'test-preview-secret' });
  });

  it('returns preview secret for authorized superadmin', async () => {
    verifyAccessTokenMock.mockReturnValue({ id: '1', type: 'superadmin' });

    const response = await GET(buildRequest({ accessToken: 'valid-token' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ previewSecret: 'test-preview-secret' });
  });
});
