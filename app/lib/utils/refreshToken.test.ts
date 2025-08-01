import { refreshToken } from './refreshToken';
import { errors } from '~/constants/errors';
import { REFRESH_TOKEN_MUTATION } from '~/types/graphql/refreshTokenGraphQl';

global.fetch = jest.fn();

beforeEach(() => {
  (global.fetch as jest.Mock).mockClear();
  jest.resetModules();
});

describe('refreshToken Utility', () => {
  it('should successfully complete the request and refresh the token', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          refreshToken: {
            success: true
          }
        }
      })
    });

    await expect(refreshToken()).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query: REFRESH_TOKEN_MUTATION })
    });
  });

  it('should throw an error if the server returned a GraphQL error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{ message: 'Token is invalid' }]
      })
    });
    await expect(refreshToken()).rejects.toThrow(errors.FAILED_TO_REFRESH);
  });

  it('should throw an error if the network fetch request fails', async () => {
    const networkError = new Error('Network request failed');
    (global.fetch as jest.Mock).mockRejectedValue(networkError);
    await expect(refreshToken()).rejects.toThrow(networkError);
  });

  it('should send only ONE fetch request when multiple simultaneous calls are made', async () => {
    let resolveFetch: (value: unknown) => void;
    const longRunningPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    (global.fetch as jest.Mock).mockReturnValue(longRunningPromise);

    const promise1 = refreshToken();
    const promise2 = refreshToken();
    const promise3 = refreshToken();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    resolveFetch!({
      ok: true,
      json: async () => ({ data: { refreshToken: { success: true } } })
    });

    await expect(Promise.all([promise1, promise2, promise3])).resolves.toEqual([undefined, undefined, undefined]);
  });
});
