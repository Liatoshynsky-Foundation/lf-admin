'use client';

import { useCallback } from 'react';

import { OpusErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import {
  type CreateOpusInput,
  type CreateOpusMutation,
  type CreateOpusMutationVariables,
  type DeleteOpusMutationVariables,
  type OpusFiltersInput,
  OpusNumberKind,
  type UpdateOpusMutation,
  type UpdateOpusMutationVariables,
  useAllOpusesQuery,
  useCreateOpusMutation,
  useDeleteOpusMutation,
  useOpusByIdQuery,
  useSearchCompositionsQuery,
  useUpdateOpusMutation
} from '~/types/graphql/generated/graphql';

type QueryHookOptions = Readonly<{
  skip?: boolean;
}>;

export const useOpusById = (id: string, options: QueryHookOptions = {}) =>
  useOpusByIdQuery({ variables: { id }, fetchPolicy: 'network-only', skip: options.skip || !id });

export const useAllOpusGroups = (filters?: OpusFiltersInput, options: QueryHookOptions = {}) =>
  useAllOpusesQuery({
    variables: { filters: { ...filters, numberKind: OpusNumberKind.Op } },
    fetchPolicy: 'network-only',
    skip: options.skip
  });

export const useAllUngroupedGroups = (filters?: OpusFiltersInput, options: QueryHookOptions = {}) =>
  useAllOpusesQuery({
    variables: { filters: { ...filters, numberKind: OpusNumberKind.Woo } },
    fetchPolicy: 'network-only',
    skip: options.skip
  });

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
