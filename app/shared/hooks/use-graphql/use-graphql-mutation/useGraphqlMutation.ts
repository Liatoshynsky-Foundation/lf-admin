import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

import { graphqlFetcher } from '~/hooks/use-graphql-fetcher/useGraphqlFetcher';

export const useGraphqlMutation = <TData, TVariables>(
  query: string,
  options?: UseMutationOptions<TData, Error, TVariables>
): UseMutationResult<TData, Error, TVariables> => {
  const mutationFn = async (variables: TVariables): Promise<TData> => {
    return graphqlFetcher<TData, TVariables>({
      query,
      variables
    });
  };

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    ...options
  });
};
