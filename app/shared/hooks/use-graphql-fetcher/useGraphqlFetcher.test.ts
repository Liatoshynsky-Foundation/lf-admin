import { graphqlFetcher } from './useGraphqlFetcher';
import { AuthError } from '~/back-constants/apolloCustomErrors/authErrors';
import { errors } from '~/constants/errors';

global.fetch = jest.fn();

const mockedFetch = fetch as jest.Mock;

describe('graphqlFetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('should throw AuthError if extensions code is UNAUTHENTICATED', async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{ extensions: { code: 'UNAUTHENTICATED' } }]
      })
    });

    await expect(graphqlFetcher({ query: 'query { test }' })).rejects.toThrow(AuthError);
  });

  it('should return data even if other GraphQL errors exist (not UNAUTHENTICATED)', async () => {
    const mockData = { test: 'ok' };
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockData,
        errors: [{ extensions: { code: 'SOME_OTHER_ERROR' } }]
      })
    });

    const result = await graphqlFetcher({ query: 'query { test }' });
    expect(result).toEqual(mockData);
  });
});
