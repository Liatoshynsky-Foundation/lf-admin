const mockDbConnect = jest.fn();
const toArrayMock = jest.fn();
const limitMock = jest.fn(() => ({ toArray: toArrayMock }));
const skipMock = jest.fn(() => ({ limit: limitMock }));
const sortMock = jest.fn(() => ({ skip: skipMock }));
const findMock = jest.fn(() => ({ sort: sortMock }));
const countDocumentsMock = jest.fn();

jest.doMock('~/infrastructure/db/connect', () => ({
  __esModule: true,
  default: mockDbConnect
}));

jest.doMock('mongoose', () => ({
  __esModule: true,
  default: {
    connection: {
      db: {
        collection: jest.fn(() => ({
          find: findMock,
          countDocuments: countDocumentsMock
        }))
      }
    }
  }
}));

describe('logRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns paginated logs ordered by newest first with normalized metadata', async () => {
    const { getLogs } = await import('./logRepository');
    const id = '507f1f77bcf86cd799439011';

    countDocumentsMock.mockResolvedValue(1);
    toArrayMock.mockResolvedValue([
      {
        _id: id,
        level: 'error',
        message: 'Database connection failed',
        timestamp: '2026-05-12T10:00:00.000Z',
        meta: {
          method: 'GET',
          url: '/api/health',
          statusCode: 500,
          stack: 'Error: fail'
        },
        requestId: 'req-1'
      }
    ]);

    const result = await getLogs({ level: 'error', page: 2, limit: 10, from: '2026-05-12T00:00:00.000Z' });

    expect(mockDbConnect).toHaveBeenCalled();
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
        timestamp: expect.objectContaining({ $gte: new Date('2026-05-12T00:00:00.000Z') })
      })
    );
    expect(skipMock).toHaveBeenCalledWith(10);
    expect(limitMock).toHaveBeenCalledWith(10);
    expect(countDocumentsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error'
      })
    );
    expect(result).toEqual({
      items: [
        {
          id: id.toString(),
          level: 'error',
          message: 'Database connection failed',
          timestamp: '2026-05-12T10:00:00.000Z',
          meta: {
            method: 'GET',
            url: '/api/health',
            statusCode: 500,
            stack: 'Error: fail',
            metadata: { method: 'GET', url: '/api/health', statusCode: 500, stack: 'Error: fail' },
            raw: { requestId: 'req-1' }
          }
        }
      ],
      pagination: { page: 2, limit: 10, total: 1 }
    });
  });

  it('returns warn logs when warn filter is requested', async () => {
    const { getLogs } = await import('./logRepository');
    const id = '507f191e810c19729de860ea';

    countDocumentsMock.mockResolvedValue(1);
    toArrayMock.mockResolvedValue([
      {
        _id: id,
        level: 'warn',
        message: 'Storage fallback is in use',
        timestamp: '2026-05-12T11:00:00.000Z'
      }
    ]);

    const result = await getLogs({ level: 'warn', page: 1, limit: 20 });

    expect(findMock).toHaveBeenCalledWith({ level: 'warn' });
    expect(result.items).toEqual([
      {
        id: id.toString(),
        level: 'warn',
        message: 'Storage fallback is in use',
        timestamp: '2026-05-12T11:00:00.000Z',
        meta: {
          method: undefined,
          url: undefined,
          statusCode: undefined,
          stack: undefined,
          metadata: undefined,
          raw: undefined
        }
      }
    ]);
  });
});
