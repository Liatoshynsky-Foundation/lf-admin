import { errors } from '~/constants/errors';

export interface FetcherOptions<TVariables> {
  query: string;
  variables?: TVariables;
  headers?: Record<string, string>;
}

export const graphqlFetcher = async <TData, TVariables>(options: FetcherOptions<TVariables>): Promise<TData> => {
  const { query, variables, headers } = options;

  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    credentials: 'include',
    body: JSON.stringify({
      query,
      variables
    })
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(errors.RESPONSE_NOT_OK);
  }

  return json.data;
};
