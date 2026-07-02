type NextResponseBody = {
  data?: unknown;
  errors?: Array<{ message: string }>;
};

type NextResponseOptions = {
  status?: number;
};

type MockRequest = {
  json: () => Promise<{ query: string; variables?: Record<string, unknown> }>;
  cookies: { get: () => undefined };
};

type RouteModule = {
  POST: (req: MockRequest) => Promise<{ body: NextResponseBody; status: number }>;
  GET: (req: MockRequest) => Promise<{ body: NextResponseBody; status: number }>;
};

describe('graphql route POST', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns data and applies cookie actions when single result', async () => {
    const mockSet = jest.fn();
    const mockDelete = jest.fn();

    jest.doMock('next/server', () => ({
      NextResponse: {
        json: (body: NextResponseBody, opts?: NextResponseOptions) => ({
          body,
          status: opts?.status ?? 200,
          cookies: { set: mockSet, delete: mockDelete }
        })
      }
    }));

    jest.doMock('~/api/graphql/apolloServer', () => ({
      getApolloServer: () => ({
        executeOperation: jest
          .fn()
          .mockResolvedValue({ body: { kind: 'single', singleResult: { data: { ok: true } } } })
      })
    }));

    const cookieActions = [
      { action: 'set', name: 'a', value: '1', options: {} },
      { action: 'delete', name: 'b', options: {} }
    ];
    jest.doMock('~/api/graphql/context', () => ({ createGraphQLContext: () => ({ cookieActions }) }));

    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { POST } = require('~/api/graphql/route') as RouteModule;
    const req: MockRequest = { json: async () => ({ query: 'q', variables: {} }), cookies: { get: () => undefined } };

    const res = await POST(req);

    expect(res.body).toBeDefined();
    expect(res.body.data).toEqual({ ok: true });
    expect(mockSet).toHaveBeenCalledWith('a', '1', {});
    expect(mockDelete).toHaveBeenCalled();
  });

  it('returns 501 for non-single body kind', async () => {
    jest.doMock('next/server', () => ({
      NextResponse: {
        json: (body: NextResponseBody, opts?: NextResponseOptions) => ({
          body,
          status: opts?.status ?? 200,
          cookies: { set: jest.fn(), delete: jest.fn() }
        })
      }
    }));

    jest.doMock('~/api/graphql/apolloServer', () => ({
      getApolloServer: () => ({ executeOperation: jest.fn().mockResolvedValue({ body: { kind: 'incremental' } }) })
    }));
    jest.doMock('~/api/graphql/context', () => ({ createGraphQLContext: () => ({ cookieActions: [] }) }));

    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { POST } = require('~/api/graphql/route') as RouteModule;
    const req: MockRequest = { json: async () => ({ query: 'q' }), cookies: { get: () => undefined } };

    const res = await POST(req);

    expect(res.status).toBe(501);
    expect(res.body).toEqual({ errors: [{ message: 'Incremental delivery is not supported.' }] });
  });

  it('aliases GET to POST and returns same response', async () => {
    const mockSet = jest.fn();
    const mockDelete = jest.fn();

    jest.doMock('next/server', () => ({
      NextResponse: {
        json: (body: NextResponseBody, opts?: NextResponseOptions) => ({
          body,
          status: opts?.status ?? 200,
          cookies: { set: mockSet, delete: mockDelete }
        })
      }
    }));

    jest.doMock('~/api/graphql/apolloServer', () => ({
      getApolloServer: () => ({
        executeOperation: jest
          .fn()
          .mockResolvedValue({ body: { kind: 'single', singleResult: { data: { ok: true } } } })
      })
    }));
    const cookieActions = [{ action: 'set', name: 'a', value: '1', options: {} }];
    jest.doMock('~/api/graphql/context', () => ({ createGraphQLContext: () => ({ cookieActions }) }));

    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { GET } = require('~/api/graphql/route') as RouteModule;
    const req: MockRequest = { json: async () => ({ query: 'q', variables: {} }), cookies: { get: () => undefined } };

    const res = await GET(req);
    expect(res.body.data).toEqual({ ok: true });
    expect(mockSet).toHaveBeenCalled();
  });

  it('returns errors when singleResult contains only errors', async () => {
    jest.resetModules();

    jest.doMock('next/server', () => ({
      NextResponse: {
        json: (body: NextResponseBody, opts?: NextResponseOptions) => ({
          body,
          status: opts?.status ?? 200,
          cookies: { set: jest.fn(), delete: jest.fn() }
        })
      }
    }));

    jest.doMock('~/api/graphql/apolloServer', () => ({
      getApolloServer: () => ({
        executeOperation: jest.fn().mockResolvedValue({
          body: { kind: 'single', singleResult: { errors: [{ message: 'err' }] } }
        })
      })
    }));
    jest.doMock('~/api/graphql/context', () => ({ createGraphQLContext: () => ({ cookieActions: [] }) }));

    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { POST } = require('~/api/graphql/route') as RouteModule;
    const req: MockRequest = { json: async () => ({ query: 'q', variables: {} }), cookies: { get: () => undefined } };

    const res = await POST(req);
    expect(res.body.errors).toEqual([{ message: 'err' }]);
    expect(res.body.data).toBeUndefined();
  });
});

export {};
