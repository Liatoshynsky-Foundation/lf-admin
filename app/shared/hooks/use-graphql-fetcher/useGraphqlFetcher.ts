import { AuthError } from '~/back-constants/apolloCustomErrors/authErrors';
import { errors } from '~/constants/errors';
import { refreshToken } from '~/utils/refreshToken';

export interface FetcherOptions<TVariables> {
  query: string;
  variables?: TVariables;
}

export const graphqlFetcher = async <TData, TVariables>(options: FetcherOptions<TVariables>): Promise<TData> => {
  const { query, variables } = options;

  const makeRequest = async () => {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        query,
        variables
      })
    });

    const json = await response.json();
    const hasAuthError = json.errors?.some(
      (e: { extensions?: { code?: string } }) => e.extensions?.code === 'UNAUTHENTICATED'
    );

    return { response, json, hasAuthError };
  };

  const firstAttempt = await makeRequest();

  if (firstAttempt.hasAuthError) {
    try {
      await refreshToken();
      const retryAttempt = await makeRequest();

      if (retryAttempt.hasAuthError) {
        globalThis.location.href = '/login';
        throw new AuthError();
      }

      if (!retryAttempt.response.ok) {
        throw new Error(errors.RESPONSE_NOT_OK);
      }

      return retryAttempt.json.data;
    } catch (refreshError) {
      globalThis.location.href = '/login';
      throw refreshError instanceof AuthError ? refreshError : new AuthError();
    }
  }

  if (!firstAttempt.response.ok) {
    throw new Error(errors.RESPONSE_NOT_OK);
  }

  return firstAttempt.json.data;
};
