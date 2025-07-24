import { errors } from '~/constants/errors';
import { REFRESH_TOKEN_MUTATION } from '~/types/graphql/mutations/refreshToken';

let refreshTokenPromise: Promise<void> | null = null;

export const refreshToken = (): Promise<void> => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }
  refreshTokenPromise = new Promise(async (resolve, reject) => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          query: REFRESH_TOKEN_MUTATION
        })
      });

      const json = await response.json();
      if (json.errors || !json.data?.refreshToken?.success) {
        throw new Error(errors.FAILED_TO_REFRESH);
      }
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      refreshTokenPromise = null;
    }
  });

  return refreshTokenPromise;
};
