import { GET } from './route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any) => ({
      status: 200,
      json: async () => body
    })
  }
}));

describe('GET /api/config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return the CLIENT_BASE_URL from environment variables', async () => {
    process.env.CLIENT_BASE_URL = 'https://test-client-url.com';

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ clientAppUrl: 'https://test-client-url.com' });
  });
});
