import 'whatwg-fetch';
import { ApolloClient, from, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';

import { errorLink } from './apollo-client';
import { TEST_QUERY } from '~/types/graphql/testGraphql';
import { refreshToken } from '~/utils/refreshToken';
jest.mock('~/utils/refreshToken');

const mockedRefreshToken = refreshToken as jest.Mock;

describe('Apollo Client Link Chain', () => {
  let client: ApolloClient<NormalizedCacheObject>;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    const consoleObj = globalThis['console'];
    const originalWarn = consoleObj.warn;
    const originalError = consoleObj.error;

    consoleWarnSpy = jest.spyOn(consoleObj, 'warn').mockImplementation((...args) => {
      const firstArg = args[0];
      if (
        typeof firstArg === 'string' &&
        (firstArg.includes('go.apollo.dev') || firstArg.includes('canonizeResults'))
      ) {
        return;
      }
      originalWarn.apply(consoleObj, args);
    });

    consoleErrorSpy = jest.spyOn(consoleObj, 'error').mockImplementation((...args) => {
      const firstArg = args[0];
      if (
        typeof firstArg === 'string' &&
        (firstArg.includes('go.apollo.dev') || firstArg.includes('An error occurred'))
      ) {
        return;
      }
      originalError.apply(consoleObj, args);
    });
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    mockedRefreshToken.mockClear();
  });

  it('should successfully execute the query when there are no errors', async () => {
    const successData = { user: { id: '1', name: 'Test User' } };

    const mockHttpLink = new MockLink([
      {
        request: { query: TEST_QUERY },
        result: { data: successData }
      }
    ]);

    client = new ApolloClient({
      link: from([errorLink, mockHttpLink]),
      cache: new InMemoryCache()
    });

    const { data } = await client.query({ query: TEST_QUERY });

    expect(data).toEqual(successData);
    expect(mockedRefreshToken).not.toHaveBeenCalled();
  });

  it('should call refreshToken and retry the request on error UNAUTHENTICATED', async () => {
    const unauthenticatedError = new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
    const successData = { user: { id: '1', name: 'Test User' } };

    const mockHttpLink = new MockLink([
      {
        request: { query: TEST_QUERY },
        result: { errors: [unauthenticatedError] }
      },
      {
        request: { query: TEST_QUERY },
        result: { data: successData }
      }
    ]);

    mockedRefreshToken.mockResolvedValue(undefined);

    const client = new ApolloClient({
      link: from([errorLink, mockHttpLink]),
      cache: new InMemoryCache()
    });

    const { data } = await client.query({ query: TEST_QUERY });

    expect(data).toEqual(successData);
    expect(mockedRefreshToken).toHaveBeenCalledTimes(1);
  });

  it('should return an error if refreshToken fails', async () => {
    const unauthenticatedError: GraphQLError = new GraphQLError('Not authenticated', {
      extensions: {
        code: 'UNAUTHENTICATED'
      }
    });

    const mockHttpLink = new MockLink([{ request: { query: TEST_QUERY }, result: { errors: [unauthenticatedError] } }]);

    const refreshError = new Error('Refresh failed');
    mockedRefreshToken.mockRejectedValue(refreshError);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete window.location;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.location = { href: '' };

    client = new ApolloClient({
      link: from([errorLink, mockHttpLink]),
      cache: new InMemoryCache()
    });

    await expect(client.query({ query: TEST_QUERY })).rejects.toThrow('Refresh failed');
    expect(mockedRefreshToken).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('/login');
  });
});
