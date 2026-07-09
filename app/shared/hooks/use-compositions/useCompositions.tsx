import { CompositionFiltersInput, useAllCompositionsQuery } from '~/types/graphql/generated/graphql';

type QueryHookOptions = Readonly<{
  skip?: boolean;
}>;

export const useAllCompositions = (filters?: CompositionFiltersInput, options: QueryHookOptions = {}) =>
  useAllCompositionsQuery({
    variables: { filters: { ...filters, isStandalone: true } },
    fetchPolicy: 'network-only',
    skip: options.skip
  });
