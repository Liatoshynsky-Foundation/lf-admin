import { QueryKey, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { graphqlFetcher } from '~/hooks/use-graphql-fetcher/useGraphqlFetcher';

export const useGraphqlQuery = <TData, TVariables>(
  key: QueryKey,
  query: string,
  variables?: TVariables,
  options?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, Error> => {
  const queryFn = async (): Promise<TData> => {
    return graphqlFetcher<TData, TVariables>({ query, variables });
  };
  return useQuery<TData, Error, TData>({
    queryKey: key,
    queryFn,
    ...options
  });
};
