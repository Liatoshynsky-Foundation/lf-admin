'use client';

import { useCallback } from 'react';

import { FundErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  type Case,
  type CreateCaseInput,
  type CreateCaseMutation,
  type CreateCaseMutationVariables,
  type CreateFundInput,
  type CreateFundMutation,
  type CreateFundMutationVariables,
  type DeleteCaseMutationVariables,
  type DeleteFundMutationVariables,
  type FundFiltersInput,
  SortOrder,
  type UpdateCaseMutation,
  type UpdateCaseMutationVariables,
  type UpdateFundMutation,
  type UpdateFundMutationVariables,
  useAllCasesQuery,
  useAllFundsQuery,
  useCreateCaseMutation,
  useCreateFundMutation,
  useDeleteCaseMutation,
  useDeleteFundMutation,
  useFundByIdQuery,
  useUpdateCaseMutation,
  useUpdateFundMutation} from '~/types/graphql/generated/graphql';

type QueryHookOptions = Readonly<{
  skip?: boolean;
}>;

const statusMap: Record<string, BaseContentStatuses> = {
  draft: BaseContentStatuses.Draft,
  published: BaseContentStatuses.Published,
  hidden: BaseContentStatuses.Hidden,
  archived: BaseContentStatuses.Archived,
  editing: BaseContentStatuses.Editing,
};

export const useFundById = (id: string, options: QueryHookOptions = {}) =>
  useFundByIdQuery({ variables: { id }, fetchPolicy: 'network-only', skip: options.skip || !id });

export const useCasesByFundId = (fundId?: string) => {
  const { data, loading, error, refetch } = useAllCasesQuery({
    variables: { filters: fundId ? { fundId, sort: [{ field: 'order', order: SortOrder.Asc }] } : undefined },
    fetchPolicy: 'network-only',
    skip: !fundId
  });

  return {
    cases: (data?.allCases ?? []) as Case[],
    loading,
    error,
    refetch
  };
};

export function useAllFunds(filters?: FundFiltersInput | null) {
  const { data, loading, error, refetch } = useAllFundsQuery({
    variables: { filters },
    fetchPolicy: 'network-only'
  });

  const funds = (data?.findAllFunds ?? []).map((f) => {
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
  });

  return { funds, loading, error, refetch };
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

export const useCreateCase = () => {
  const [mutate, meta] = useCreateCaseMutation();
  const createCase = useCallback(
    async (input: CreateCaseInput) =>
      safeMutate<CreateCaseMutation, CreateCaseMutationVariables>(
        mutate,
        { input },
        'Помилка мережі при створенні справи',
        'Не вдалося створити справу'
      ),
    [mutate]
  );
  return [createCase, meta] as const;
};

export const useUpdateCase = () => {
  const [mutate, meta] = useUpdateCaseMutation();
  const updateCase = useCallback(
    async (variables: UpdateCaseMutationVariables) =>
      safeMutate<UpdateCaseMutation, UpdateCaseMutationVariables>(
        mutate,
        variables,
        'Помилка мережі при оновленні справи',
        'Не вдалося оновити справу'
      ),
    [mutate]
  );
  return [updateCase, meta] as const;
};

export const useDeleteCase = () => {
  const [mutate, meta] = useDeleteCaseMutation();
  const deleteCase = useCallback(
    async (variables: DeleteCaseMutationVariables) =>
      safeMutate(mutate, variables, 'Помилка мережі при видаленні справи', 'Не вдалося видалити справу'),
    [mutate]
  );
  return [deleteCase, meta] as const;
};