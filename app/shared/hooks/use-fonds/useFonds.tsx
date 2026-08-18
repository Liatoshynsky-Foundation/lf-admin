'use client';

import { useCallback } from 'react';

import { FondErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  type CreateFondInput,
  type CreateFondMutation,
  type CreateFondMutationVariables,
  type DeleteFondMutationVariables,
  type FondFiltersInput,
  type UpdateFondMutation,
  type UpdateFondMutationVariables,
  useAllFondsQuery,
  useCreateFondMutation,
  useDeleteFondMutation,
  useFondByIdQuery,
  useUpdateFondMutation
} from '~/types/graphql/generated/graphql';

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

export const useFondById = (id: string, options: QueryHookOptions = {}) =>
  useFondByIdQuery({ variables: { id }, fetchPolicy: 'network-only', skip: options.skip || !id });

export function useAllFonds(filters?: FondFiltersInput | null) {
  const { data, loading, error } = useAllFondsQuery({
    variables: { filters },
    fetchPolicy: 'network-only'
  });

  const fonds = (data?.findAllFonds ?? []).map((f) => {
    const dates = f.chronologicalBoundaries?.uk ?? f.documentCreationDate.uk;
    const status = statusMap[f.status] ?? BaseContentStatuses.Hidden;

    return {
      id: f.id,
      fondNumber: f.fondNumber,
      name: f.name.uk,
      descriptions: f.descriptionsCount,
      cases: f.casesCount,
      dates,
      status,
      updatedAt: f.updatedAt
    };
  });

  return { fonds, loading, error };
}

export const useCreateFond = () => {
  const [mutate, meta] = useCreateFondMutation();
  
  const createFond = useCallback(
    async (fond: CreateFondInput) =>
      safeMutate<CreateFondMutation, CreateFondMutationVariables>(
        mutate,
        { input: fond },
        FondErrors.NETWORK_ERROR_CREATE ?? 'Помилка мережі при створенні',
        FondErrors.FAILED_TO_CREATE ?? 'Не вдалося зберегти фонд'
      ),
    [mutate]
  );
  
  return [createFond, meta] as const;
};

export const useUpdateFond = () => {
  const [mutate, meta] = useUpdateFondMutation();
  
  const updateFond = useCallback(
    async (variables: UpdateFondMutationVariables) =>
      safeMutate<UpdateFondMutation, UpdateFondMutationVariables>(
        mutate,
        variables,
        FondErrors.NETWORK_ERROR_UPDATE ?? 'Помилка мережі при оновленні',
        FondErrors.FAILED_TO_UPDATE ?? 'Не вдалося оновити фонд'
      ),
    [mutate]
  );
  
  return [updateFond, meta] as const;
};

export const useDeleteFond = () => {
  const [mutate, meta] = useDeleteFondMutation();
  
  const deleteFond = useCallback(
    async (variables: DeleteFondMutationVariables) =>
      safeMutate(
        mutate, 
        variables, 
        FondErrors.NETWORK_ERROR_DELETE ?? 'Помилка мережі при видаленні', 
        FondErrors.FAILED_TO_DELETE ?? 'Не вдалося видалити фонд'
      ),
    [mutate]
  );
  
  return [deleteFond, meta] as const;
};