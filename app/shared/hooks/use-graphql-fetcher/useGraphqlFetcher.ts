import { AuthError } from '~/back-constants/apolloCustomErrors/authErrors';
import { errors } from '~/constants/errors';

export interface FetcherOptions<TVariables> {
  query: string;
  variables?: TVariables;
}

export const graphqlFetcher = async <TData, TVariables>(options: FetcherOptions<TVariables>): Promise<TData> => {
  const { query, variables } = options;

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
  if (hasAuthError) {
    throw new AuthError();
  }
  if (!response.ok) {
    throw new Error(errors.RESPONSE_NOT_OK);
  }

  return json.data;
};
