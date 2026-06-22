import { GET } from './route';

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
