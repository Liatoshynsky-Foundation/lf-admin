'use client';

import { useCallback } from 'react';

import { GroupRowData, IndividualWork } from '~/(logged_in)/creativity/WorksTable';
import { OpusErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  type CreateOpusInput,
  type CreateOpusMutation,
  type CreateOpusMutationVariables,
  type DeleteOpusMutationVariables,
  OpusStatus,
  type UpdateOpusMutation,
  type UpdateOpusMutationVariables,
  useCreateOpusMutation,
  useDeleteOpusMutation,
  useOpusByIdQuery,
  usePaginatedWorksQuery,
  useSearchCompositionsQuery,
  useUpdateOpusMutation,
  WorksFiltersInput,
  WorksTab
} from '~/types/graphql/generated/graphql';

type QueryHookOptions = Readonly<{
  skip?: boolean;
}>;
export const useOpusById = (id: string, options: QueryHookOptions = {}) =>
  useOpusByIdQuery({ variables: { id }, fetchPolicy: 'network-only', skip: options.skip || !id });

export function usePaginatedWorks(tab?: WorksTab | null, filters?: WorksFiltersInput | null) {
  const { data, loading, error } = usePaginatedWorksQuery({
    variables: {
      tab,
      filters
    },
    fetchPolicy: 'network-only'
  });

  console.log('data:', data);

  const groups: GroupRowData[] = (data?.paginatedWorks.groups ?? []).map((g) => ({
    id: g.id,
    number: g.number,
    numberKind: g.numberKind === 'op' ? 'op' : 'sineop',
    name: g.name.uk,
    genre: g.genre ?? '',
    startDate: g.creationYear,
    status: g.status === OpusStatus.Published ? BaseContentStatuses.Published : BaseContentStatuses.Draft,
    updatedAt: g.updatedAt,
    compositions:
      g.compositions?.map((c) => ({
        id: c.id,
        name: c.name.uk
      })) ?? []
  }));

  const works: IndividualWork[] = (data?.paginatedWorks.works ?? []).map((w) => ({
    id: w.id,
    name: w.name.uk,
    year: w.year,
    genre: w.genre,
    status: BaseContentStatuses.Draft,
    updatedAt: w.updatedAt
  }));

  return {
    items: { groups, works },
    totalPages: data?.paginatedWorks.totalPages ?? 0,
    totalItems: data?.paginatedWorks.total ?? 0,
    loading,
    error
  };
}

export const useSearchCompositions = (search: string, options: QueryHookOptions = {}) =>
  useSearchCompositionsQuery({ variables: { search }, fetchPolicy: 'network-only', skip: options.skip || !search });

export const useCreateOpus = () => {
  const [mutate, meta] = useCreateOpusMutation();
  const createOpus = useCallback(
    async (opus: CreateOpusInput) =>
      safeMutate<CreateOpusMutation, CreateOpusMutationVariables>(
        mutate,
        { input: opus },
        OpusErrors.NETWORK_ERROR_CREATE,
        OpusErrors.FAILED_TO_CREATE
      ),
    [mutate]
  );
  return [createOpus, meta] as const;
};

export const useUpdateOpus = () => {
  const [mutate, meta] = useUpdateOpusMutation();
  const updateOpus = useCallback(
    async (variables: UpdateOpusMutationVariables) =>
      safeMutate<UpdateOpusMutation, UpdateOpusMutationVariables>(
        mutate,
        variables,
        OpusErrors.NETWORK_ERROR_UPDATE,
        OpusErrors.FAILED_TO_UPDATE
      ),
    [mutate]
  );
  return [updateOpus, meta] as const;
};

export const useDeleteOpus = () => {
  const [mutate, meta] = useDeleteOpusMutation();
  const deleteOpus = useCallback(
    async (variables: DeleteOpusMutationVariables) =>
      safeMutate(mutate, variables, OpusErrors.NETWORK_ERROR_DELETE, OpusErrors.FAILED_TO_DELETE),
    [mutate]
  );
  return [deleteOpus, meta] as const;
};
