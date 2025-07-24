import { errors } from '~/constants/errors';
import { REFRESH_TOKEN_MUTATION } from '~/types/graphql/mutations/refreshToken';

let refreshTokenPromise: Promise<void> | null = null;

const performRefresh = async (): Promise<void> => {
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
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during token refresh');
  }
};

export const refreshToken = (): Promise<void> => {
  if (!refreshTokenPromise) {
    refreshTokenPromise = performRefresh().finally(() => {
      refreshTokenPromise = null;
    });
  }

  return refreshTokenPromise;
};
