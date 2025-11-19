'use client';

import { useCallback } from 'react';

import { safeMutate } from '~/lib/utils/safeMutate';
import {
  type AllNewsQueryVariables,
  type CreateNewsMutation,
  type CreateNewsMutationVariables,
  type DeleteNewsMutation,
  type DeleteNewsMutationVariables,
  type NewsCountQueryVariables,
  type PaginatedNewsQueryVariables,
  type PublishNewsMutation,
  type PublishNewsMutationVariables,
  type UpdateNewsMutation,
  type UpdateNewsMutationVariables,
  useAllNewsQuery,
  useArchiveNewsMutation,
  useCreateNewsMutation,
  useDeleteNewsMutation,
  useHideNewsMutation,
  useIncrementNewsViewsMutation,
  useNewsCountQuery,
  usePaginatedNewsQuery,
  usePublishedNewsQuery,
  usePublishNewsMutation,
  useUnpublishNewsMutation,
  useUpdateNewsMutation
} from '~/types/graphql/generated/graphql';

export const useNewsQueries = () => {
  const useAllNews = (variables?: AllNewsQueryVariables) => {
    return useAllNewsQuery({ variables, fetchPolicy: 'network-only' });
  };

  const usePublishedNews = (variables?: AllNewsQueryVariables) => {
    return usePublishedNewsQuery({ variables, fetchPolicy: 'cache-first' });
  };

  const usePaginatedNews = (variables?: PaginatedNewsQueryVariables) => {
    return usePaginatedNewsQuery({ variables, fetchPolicy: 'network-only' });
  };

  const useNewsCount = (variables?: NewsCountQueryVariables) => {
    return useNewsCountQuery({ variables });
  };

  return {
    useAllNews,
    usePublishedNews,
    usePaginatedNews,
    useNewsCount
  };
};

export const useNewsMutations = () => {
  const [createMutate, { loading: creating }] = useCreateNewsMutation();
  const [updateMutate, { loading: updating }] = useUpdateNewsMutation();
  const [publishMutate, { loading: publishing }] = usePublishNewsMutation();
  const [unpublishMutate, { loading: unpublishing }] = useUnpublishNewsMutation();
  const [archiveMutate, { loading: archiving }] = useArchiveNewsMutation();
  const [hideMutate, { loading: hiding }] = useHideNewsMutation();
  const [deleteMutate, { loading: deleting }] = useDeleteNewsMutation();
  const [incrementViewsMutate] = useIncrementNewsViewsMutation();

  const createNews = useCallback(
    async (variables: CreateNewsMutationVariables) => {
      return safeMutate<CreateNewsMutation, CreateNewsMutationVariables>(
        createMutate,
        variables,
        'Network error while creating news',
        'Failed to create news'
      );
    },
    [createMutate]
  );

  const updateNews = useCallback(
    async (variables: UpdateNewsMutationVariables) => {
      return safeMutate<UpdateNewsMutation, UpdateNewsMutationVariables>(
        updateMutate,
        variables,
        'Network error while updating news',
        'Failed to update news'
      );
    },
    [updateMutate]
  );

  const publishNews = useCallback(
    async (variables: PublishNewsMutationVariables) => {
      return safeMutate<PublishNewsMutation, PublishNewsMutationVariables>(
        publishMutate,
        variables,
        'Network error while publishing news',
        'Failed to publish news'
      );
    },
    [publishMutate]
  );

  const unpublishNews = useCallback(
    async (id: string) => {
      return safeMutate(unpublishMutate, { id }, 'Network error while unpublishing news', 'Failed to unpublish news');
    },
    [unpublishMutate]
  );

  const archiveNews = useCallback(
    async (id: string) => {
      return safeMutate(archiveMutate, { id }, 'Network error while archiving news', 'Failed to archive news');
    },
    [archiveMutate]
  );

  const hideNews = useCallback(
    async (id: string) => {
      return safeMutate(hideMutate, { id }, 'Network error while hiding news', 'Failed to hide news');
    },
    [hideMutate]
  );

  const deleteNews = useCallback(
    async (variables: DeleteNewsMutationVariables) => {
      return safeMutate<DeleteNewsMutation, DeleteNewsMutationVariables>(
        deleteMutate,
        variables,
        'Network error while deleting news',
        'Failed to delete news'
      );
    },
    [deleteMutate]
  );

  const incrementViews = useCallback(
    async (id: string) => {
      return incrementViewsMutate({ variables: { id } });
    },
    [incrementViewsMutate]
  );

  return {
    createNews,
    updateNews,
    publishNews,
    unpublishNews,
    archiveNews,
    hideNews,
    deleteNews,
    incrementViews,
    loading: creating || updating || publishing || unpublishing || archiving || hiding || deleting
  };
};
