jest.mock('../../../../src/interfaces/graphql', () => ({ schema: {} }));
jest.mock('../../../../src/middleware/logger/logger', () => ({ log: jest.fn() }));

type ApolloServerOptions = {
  schema: unknown;
  introspection: boolean;
  [key: string]: unknown;
};

type MockedApolloServer = {
  _opts: ApolloServerOptions;
};

type LoggerModule = {
  log: jest.Mock;
};

type ApolloServerModule = {
  getApolloServer: () => MockedApolloServer;
};

const setNodeEnv = (value: string) => {
  (process.env as unknown as { NODE_ENV: string }).NODE_ENV = value;
};

const ApolloServerMock = jest.fn((opts: ApolloServerOptions): MockedApolloServer => ({ _opts: opts }));
jest.mock('@apollo/server', () => ({ ApolloServer: ApolloServerMock }));

describe('getApolloServer', () => {
  beforeEach(() => {
    jest.resetModules();
    ApolloServerMock.mockClear();
  });

  it('creates singleton with introspection true in non-production', () => {
    setNodeEnv('test');
    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { getApolloServer } = require('../apolloServer') as ApolloServerModule;

    const server1 = getApolloServer();
    const server2 = getApolloServer();

    expect(ApolloServerMock).toHaveBeenCalledTimes(1);
    expect(server1).toBe(server2);
    expect(server1._opts).toHaveProperty('schema');
    expect(server1._opts.introspection).toBe(true);
  });

  it('sets introspection false in production', () => {
    jest.resetModules();
    setNodeEnv('production');
    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { getApolloServer } = require('../apolloServer') as ApolloServerModule;

    const server = getApolloServer();

    expect(ApolloServerMock).toHaveBeenCalledTimes(1);
    expect(server._opts.introspection).toBe(false);
  });

  it('invokes provided onCost callback from complexity rule', () => {
    jest.resetModules();
    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const logger = require('../../../../src/middleware/logger/logger') as LoggerModule;
    const mockedCreate = jest.fn((limit: number, opts?: { onCost?: (cost: number) => void }) => {
      if (opts && typeof opts.onCost === 'function') opts.onCost(555);
      return () => {};
    });
    jest.doMock('graphql-validation-complexity', () => ({ createComplexityLimitRule: mockedCreate }));

    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    const { getApolloServer } = require('../apolloServer') as ApolloServerModule;
    getApolloServer();

    expect(mockedCreate).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith('Query cost:', 555);
  });
});

export {};
