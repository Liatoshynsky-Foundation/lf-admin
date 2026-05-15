import { GET } from './route';
import { getLogs } from '~/infrastructure/repositories/logRepository/logRepository';

jest.mock('~/infrastructure/repositories/logRepository/logRepository', () => ({
  __esModule: true,
  getLogs: jest.fn()
}));

describe('GET /api/logs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns logs with pagination and filters', async () => {
    (getLogs as jest.Mock).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0 }
    });

    const request = new Request('http://localhost/api/logs?level=error&page=2&limit=15&from=2026-05-12T00:00:00.000Z');
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

    const request = new Request('http://localhost/api/logs?level=invalid');
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
