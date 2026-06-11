import 'whatwg-fetch';
import type { NextRequest } from 'next/server';

import { DELETE, GET } from './route';
import { deleteLogs, getLogs } from '~/infrastructure/repositories/logRepository/logRepository';

const verifyAccessTokenMock = jest.fn();

jest.mock('next/server', () => ({
  __esModule: true,
  NextResponse: {
    json: (body: any, init?: ResponseInit) => new Response(JSON.stringify(body), init)
  }
}));

jest.mock('~/infrastructure/repositories/logRepository/logRepository', () => ({
  __esModule: true,
  getLogs: jest.fn(),
  deleteLogs: jest.fn()
}));

jest.mock('~/src/application/use-cases/tokenService/createToken.service', () => ({
  __esModule: true,
  createTokenService: () => ({
    verifyAccessToken: verifyAccessTokenMock
  })
}));

const buildRequest = (url: string, cookies: Record<string, string> = {}): NextRequest => {
  const parsedUrl = new URL(url);

  return {
    nextUrl: parsedUrl,
    cookies: {
      get: (name: string) => (name in cookies ? { name, value: cookies[name] } : undefined)
    }
  } as unknown as NextRequest;
};

describe('GET /api/logs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns logs with pagination and filters', async () => {
    (getLogs as jest.Mock).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0 }
    });

    const request = buildRequest('http://localhost/api/logs?level=error&page=2&limit=15&from=2026-05-12T00:00:00.000Z');
    const response = await GET(request);

    expect(getLogs).toHaveBeenCalledWith({
      level: 'error',
      page: 2,
      limit: 15,
      from: '2026-05-12T00:00:00.000Z',
      to: undefined
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [],
      pagination: { page: 1, limit: 20, total: 0 }
    });
  });

  it('ignores invalid level values', async () => {
    (getLogs as jest.Mock).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0 }
    });

    const request = buildRequest('http://localhost/api/logs?level=invalid');
    await GET(request);

    expect(getLogs).toHaveBeenCalledWith({
      level: undefined,
      page: 1,
      limit: 20,
      from: undefined,
      to: undefined
    });
  });
});

describe('DELETE /api/logs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects requests without an access token cookie', async () => {
    const request = buildRequest('http://localhost/api/logs');
    const response = await DELETE(request);

    expect(response.status).toBe(401);
    expect(deleteLogs).not.toHaveBeenCalled();
  });

  it('rejects requests with an invalid access token', async () => {
    verifyAccessTokenMock.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const request = buildRequest('http://localhost/api/logs', { accessToken: 'bad-token' });
    const response = await DELETE(request);

    expect(response.status).toBe(401);
    expect(deleteLogs).not.toHaveBeenCalled();
  });

  it('clears all logs when no level is provided', async () => {
    verifyAccessTokenMock.mockReturnValue({ id: 'admin-1', type: 'admin' });
    (deleteLogs as jest.Mock).mockResolvedValue(10);

    const request = buildRequest('http://localhost/api/logs', { accessToken: 'valid-token' });
    const response = await DELETE(request);

    expect(deleteLogs).toHaveBeenCalledWith(undefined);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ deletedCount: 10 });
  });

  it('clears logs of a specific level when provided', async () => {
    verifyAccessTokenMock.mockReturnValue({ id: 'admin-1', type: 'admin' });
    (deleteLogs as jest.Mock).mockResolvedValue(3);

    const request = buildRequest('http://localhost/api/logs?level=error', { accessToken: 'valid-token' });
    const response = await DELETE(request);

    expect(deleteLogs).toHaveBeenCalledWith('error');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ deletedCount: 3 });
  });

  it('ignores invalid level values and clears all', async () => {
    verifyAccessTokenMock.mockReturnValue({ id: 'admin-1', type: 'admin' });
    (deleteLogs as jest.Mock).mockResolvedValue(0);

    const request = buildRequest('http://localhost/api/logs?level=invalid', { accessToken: 'valid-token' });
    await DELETE(request);

    expect(deleteLogs).toHaveBeenCalledWith(undefined);
  });
});
