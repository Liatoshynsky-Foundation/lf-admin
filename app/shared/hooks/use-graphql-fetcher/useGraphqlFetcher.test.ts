import { graphqlFetcher } from './useGraphqlFetcher';
import { AuthError } from '~/back-constants/apolloCustomErrors/authErrors';
import { errors } from '~/constants/errors';
import { refreshToken } from '~/utils/refreshToken';

globalThis.fetch = jest.fn();

const mockedFetch = fetch as jest.Mock;

jest.mock('~/utils/refreshToken', () => ({
  refreshToken: jest.fn()
}));

const mockedRefreshToken = refreshToken as jest.Mock;

describe('graphqlFetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (globalThis as any).location;
    (globalThis as any).location = { href: '' };
  });

  it('should return data on a successful API call', async () => {
    const mockQuery = 'query { test }';
    const mockVariables = { id: 1 };
    const mockResponseData = { user: { id: '1', name: 'John Doe' } };

    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockResponseData })
    });

    const result = await graphqlFetcher({ query: mockQuery, variables: mockVariables });
    expect(result).toEqual(mockResponseData);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        query: mockQuery,
        variables: mockVariables
      })
    });
  });

  it('should throw an error if the network response is not ok', async () => {
    const mockQuery = 'query { broken }';

    mockedFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' })
    });

    await expect(graphqlFetcher({ query: mockQuery })).rejects.toThrow(errors.RESPONSE_NOT_OK);
  });

  it('should refresh token and retry on UNAUTHENTICATED error', async () => {
    const mockQuery = 'query { test }';
    const mockResponseData = { user: { id: '1', name: 'John Doe' } };

    // First call returns UNAUTHENTICATED error
    // Second call (after refresh) succeeds
    mockedFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errors: [{ extensions: { code: 'UNAUTHENTICATED' } }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockResponseData })
      });

    mockedRefreshToken.mockResolvedValue(undefined);

    const result = await graphqlFetcher({ query: mockQuery });

    expect(result).toEqual(mockResponseData);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(refreshToken).toHaveBeenCalledTimes(1);
  });

  it('should redirect to login if token refresh fails', async () => {
    const mockQuery = 'query { test }';

    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{ extensions: { code: 'UNAUTHENTICATED' } }]
      })
    });

    mockedRefreshToken.mockRejectedValue(new Error('Refresh failed'));

    await expect(graphqlFetcher({ query: mockQuery })).rejects.toThrow(AuthError);
    expect(globalThis.location.href).toBe('/login');
    expect(refreshToken).toHaveBeenCalledTimes(1);
  });

  it('should redirect to login if still UNAUTHENTICATED after refresh', async () => {
    const mockQuery = 'query { test }';

    // Both calls return UNAUTHENTICATED
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{ extensions: { code: 'UNAUTHENTICATED' } }]
      })
    });

    mockedRefreshToken.mockResolvedValue(undefined);

    await expect(graphqlFetcher({ query: mockQuery })).rejects.toThrow(AuthError);
    expect(globalThis.location.href).toBe('/login');
    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
