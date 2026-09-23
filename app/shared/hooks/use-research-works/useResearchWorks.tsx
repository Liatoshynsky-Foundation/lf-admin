'use client';

import { useCallback, useMemo } from 'react';

import { collectUniqueAuthors, mapResearchWork } from './researchWorkMappers';
import { ResearchWorkErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import {
  type CreateResearchWorkInput,
  type CreateResearchWorkMutation,
  type CreateResearchWorkMutationVariables,
  type DeleteResearchWorkMutation,
  type DeleteResearchWorkMutationVariables,
  type ResearchWorkFiltersInput,
  type UpdateResearchWorkInput,
  type UpdateResearchWorkMutation,
  type UpdateResearchWorkMutationVariables,
  type UpdateResearchWorkStatusInput,
  type UpdateResearchWorkStatusMutation,
  type UpdateResearchWorkStatusMutationVariables,
  useCreateResearchWorkMutation,
  useDeleteResearchWorkMutation,
  usePaginatedResearchWorksQuery,
  useResearchWorkAuthorsQuery,
  useUpdateResearchWorkMutation,
  useUpdateResearchWorkStatusMutation
} from '~/types/graphql/generated/graphql';

const RESEARCH_LIST_REFETCH_QUERIES = ['PaginatedResearchWorks'] as const;
const RESEARCH_WORKS_REFETCH_QUERIES = ['PaginatedResearchWorks', 'ResearchWorkAuthors'] as const;

export { collectUniqueAuthors, mapResearchWork } from './researchWorkMappers';

export const usePaginatedResearchWorks = (
  page = 1,
  limit = 10,
  filters?: ResearchWorkFiltersInput
) => {
  const { data, loading, error, refetch } = usePaginatedResearchWorksQuery({
    variables: { page, limit, filters },
    fetchPolicy: 'network-only'
  });

  const paginated = data?.paginatedResearchWorks;

  return {
    items: (paginated?.items ?? []).map(mapResearchWork),
    total: paginated?.total ?? 0,
    page: paginated?.page ?? page,
    totalPages: paginated?.totalPages ?? 0,
    loading,
    error,
    refetch
  };
};

export const useResearchWorkAuthors = (options: { skip?: boolean } = {}) => {
  const { data, loading, error } = useResearchWorkAuthorsQuery({
    fetchPolicy: 'network-only',
    skip: options.skip
  });

  const authors = useMemo(
    () => collectUniqueAuthors(data?.allResearchWorks ?? []),
    [data?.allResearchWorks]
  );

  return { authors, loading, error };
};

export const useCreateResearchWork = () => {
  const [mutate, meta] = useCreateResearchWorkMutation({
    refetchQueries: [...RESEARCH_WORKS_REFETCH_QUERIES]
  });

  const createResearchWork = useCallback(
    async (input: CreateResearchWorkInput) =>
      safeMutate<CreateResearchWorkMutation, CreateResearchWorkMutationVariables>(
        mutate,
        { input },
        ResearchWorkErrors.NETWORK_ERROR_CREATE,
        ResearchWorkErrors.FAILED_TO_CREATE
      ),
    [mutate]
  );

  return [createResearchWork, meta] as const;
};

export const useUpdateResearchWork = () => {
  const [mutate, meta] = useUpdateResearchWorkMutation({
    refetchQueries: [...RESEARCH_WORKS_REFETCH_QUERIES]
  });

  const updateResearchWork = useCallback(
    async (id: string, input: UpdateResearchWorkInput) =>
      safeMutate<UpdateResearchWorkMutation, UpdateResearchWorkMutationVariables>(
        mutate,
        { id, input },
        ResearchWorkErrors.NETWORK_ERROR_UPDATE,
        ResearchWorkErrors.FAILED_TO_UPDATE
      ),
    [mutate]
  );

  return [updateResearchWork, meta] as const;
};

export const useUpdateResearchWorkStatus = () => {
  const [mutate, meta] = useUpdateResearchWorkStatusMutation({
    refetchQueries: [...RESEARCH_LIST_REFETCH_QUERIES]
  });

  const updateResearchWorkStatus = useCallback(
    async (id: string, input: UpdateResearchWorkStatusInput) =>
      safeMutate<UpdateResearchWorkStatusMutation, UpdateResearchWorkStatusMutationVariables>(
        mutate,
        { id, input },
        ResearchWorkErrors.NETWORK_ERROR_STATUS,
        ResearchWorkErrors.FAILED_TO_UPDATE_STATUS
      ),
    [mutate]
  );

  return [updateResearchWorkStatus, meta] as const;
};

export const useDeleteResearchWork = () => {
  const [mutate, meta] = useDeleteResearchWorkMutation({
    refetchQueries: [...RESEARCH_WORKS_REFETCH_QUERIES]
  });

  const deleteResearchWork = useCallback(
    async (id: string) =>
      safeMutate<DeleteResearchWorkMutation, DeleteResearchWorkMutationVariables>(
        mutate,
        { id },
        ResearchWorkErrors.NETWORK_ERROR_DELETE,
        ResearchWorkErrors.FAILED_TO_DELETE
      ),
    [mutate]
  );

  return [deleteResearchWork, meta] as const;
};
