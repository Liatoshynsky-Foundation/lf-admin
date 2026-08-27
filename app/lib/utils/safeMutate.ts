import { ApolloError, type FetchResult, type MutationFunctionOptions } from '@apollo/client';

export const apolloMessage = (e: ApolloError, networkMsg: string): string =>
  e.graphQLErrors[0]?.message ?? (e.networkError ? networkMsg : e.message);

export async function safeMutate<TData, TVariables>(
  mutate: (options?: MutationFunctionOptions<TData, TVariables>) => Promise<FetchResult<TData>>,
  variables: TVariables,
  networkMsg: string,
  fallbackMsg: string,
  options?: Omit<MutationFunctionOptions<TData, TVariables>, 'variables'>
): Promise<FetchResult<TData>> {
  try {
    return await mutate({ variables, ...options });
  } catch (e) {
    if (e instanceof ApolloError) {
      throw new Error(apolloMessage(e, networkMsg));
    }
    throw new Error(fallbackMsg);
  }
}
