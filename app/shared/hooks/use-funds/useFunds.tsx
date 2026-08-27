'use client';

import { gql, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

import { FundErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  type CreateFundInput,
  type CreateFundMutation,
  type CreateFundMutationVariables,
  type DeleteFundMutationVariables,
  type FundFiltersInput,
  type UpdateFundMutation,
  type UpdateFundMutationVariables,
  useAllFundsQuery,
  useCreateFundMutation,
  useDeleteFundMutation,
  useFundByIdQuery,
  usePaginatedFundsQuery,
  useUpdateFundMutation
} from '~/types/graphql/generated/graphql';

type QueryHookOptions = Readonly<{
  skip?: boolean;
}>;

type PublishedCasesByFundQuery = {
  allCases?: Array<{ id: string }> | null;
};

type PublishedCasesByFundVariables = {
  filters: {
    fondId: string;
    statuses: BaseContentStatuses[];
  };
};

const PUBLISHED_CASES_BY_FUND_QUERY = gql`
  query PublishedCasesByFund($filters: CaseFiltersInput) {
    allCases(filters: $filters) {
      id
    }
  }
`;

const statusMap: Record<string, BaseContentStatuses> = {
  draft: BaseContentStatuses.Draft,
  published: BaseContentStatuses.Published,
  hidden: BaseContentStatuses.Hidden,
  archived: BaseContentStatuses.Archived,
  editing: BaseContentStatuses.Editing,
};

export const useFundById = (id: string, options: QueryHookOptions = {}) =>
  useFundByIdQuery({ variables: { id }, fetchPolicy: 'network-only', skip: options.skip || !id });

type FundListItem = {
  id: string;
  fundNumber: number;
  name: { uk: string };
  documentCreationDate: { uk: string };
  chronologicalBoundaries?: { uk?: string | null } | null;
  casesCount: number;
  descriptionsCount: number;
  status: string;
  updatedAt: string;
};

const mapFundListItem = (f: FundListItem) => {
  const dates = f.chronologicalBoundaries?.uk ?? f.documentCreationDate.uk;
  const status = statusMap[f.status] ?? BaseContentStatuses.Hidden;

  return {
    id: f.id,
    fundNumber: f.fundNumber,
    name: f.name.uk,
    descriptions: f.descriptionsCount,
    cases: f.casesCount,
    dates,
    status,
    updatedAt: f.updatedAt
  };
};

export function useAllFunds(filters?: FundFiltersInput | null) {
  const { data, loading, error } = useAllFundsQuery({
    variables: { filters },
    fetchPolicy: 'network-only'
  });

  const funds = (data?.findAllFunds ?? []).map(mapFundListItem);

  return { funds, loading, error };
}

export function usePaginatedFunds(page: number, limit: number, filters?: FundFiltersInput | null) {
  const { data, loading, error } = usePaginatedFundsQuery({
    variables: { page, limit, filters },
    fetchPolicy: 'network-only'
  });

  const funds = (data?.findFundsPaginated?.items ?? []).map(mapFundListItem);

  return {
    funds,
    total: data?.findFundsPaginated?.total ?? 0,
    totalPages: data?.findFundsPaginated?.totalPages ?? 0,
    loading,
    error
  };
}

export const useCreateFund = () => {
  const [mutate, meta] = useCreateFundMutation();
  
  const createFund = useCallback(
    async (fund: CreateFundInput) =>
      safeMutate<CreateFundMutation, CreateFundMutationVariables>(
        mutate,
        { input: fund },
        FundErrors.NETWORK_ERROR_CREATE ?? 'Помилка мережі при створенні',
        FundErrors.FAILED_TO_CREATE ?? 'Не вдалося зберегти фонд'
      ),
    [mutate]
  );
  
  return [createFund, meta] as const;
};

export const useUpdateFund = () => {
  const [mutate, meta] = useUpdateFundMutation();
  
  const updateFund = useCallback(
    async (variables: UpdateFundMutationVariables) =>
      safeMutate<UpdateFundMutation, UpdateFundMutationVariables>(
        mutate,
        variables,
        FundErrors.NETWORK_ERROR_UPDATE ?? 'Помилка мережі при оновленні',
        FundErrors.FAILED_TO_UPDATE ?? 'Не вдалося оновити фонд'
      ),
    [mutate]
  );
  
  return [updateFund, meta] as const;
};

export const useHasPublishedCasesInFund = () => {
  const client = useApolloClient();

  return useCallback(
    async (fundId: string): Promise<boolean> => {
      const { data } = await client.query<PublishedCasesByFundQuery, PublishedCasesByFundVariables>({
        query: PUBLISHED_CASES_BY_FUND_QUERY,
        variables: {
          filters: {
            fondId: fundId,
            statuses: [BaseContentStatuses.Published]
          }
        },
        fetchPolicy: 'network-only'
      });

      return Boolean(data.allCases?.length);
    },
    [client]
  );
};

export const useDeleteFund = () => {
  const [mutate, meta] = useDeleteFundMutation();
  
  const deleteFund = useCallback(
    async (variables: DeleteFundMutationVariables) =>
      safeMutate(
        mutate, 
        variables, 
        FundErrors.NETWORK_ERROR_DELETE ?? 'Помилка мережі при видаленні', 
        FundErrors.FAILED_TO_DELETE ?? 'Не вдалося видалити фонд'
      ),
    [mutate]
  );
  
  return [deleteFund, meta] as const;
};
