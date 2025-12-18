'use client';

import { useCallback } from 'react';

import { newsErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import {
  type AllNewsQueryVariables,
  type CreateNewsMutation,
  type CreateNewsMutationVariables,
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
        newsErrors.NETWORK_ERROR_CREATE,
        newsErrors.FAILED_TO_CREATE
      );
    },
    [createMutate]
  );

  const updateNews = useCallback(
    async (variables: UpdateNewsMutationVariables) => {
      return safeMutate<UpdateNewsMutation, UpdateNewsMutationVariables>(
        updateMutate,
        variables,
        newsErrors.NETWORK_ERROR_UPDATE,
        newsErrors.FAILED_TO_UPDATE
      );
    },
    [updateMutate]
  );

  const publishNews = useCallback(
    async (variables: PublishNewsMutationVariables) => {
      return safeMutate<PublishNewsMutation, PublishNewsMutationVariables>(
        publishMutate,
        variables,
        newsErrors.NETWORK_ERROR_PUBLISH,
        newsErrors.FAILED_TO_PUBLISH
      );
    },
    [publishMutate]
  );

  const unpublishNews = useCallback(
    async (id: string) => {
      return safeMutate(unpublishMutate, { id }, newsErrors.NETWORK_ERROR_UNPUBLISH, newsErrors.FAILED_TO_UNPUBLISH);
    },
    [unpublishMutate]
  );

  const archiveNews = useCallback(
    async (id: string) => {
      return safeMutate(archiveMutate, { id }, newsErrors.NETWORK_ERROR_ARCHIVE, newsErrors.FAILED_TO_ARCHIVE);
    },
    [archiveMutate]
  );

  const hideNews = useCallback(
    async (id: string) => {
      return safeMutate(hideMutate, { id }, newsErrors.NETWORK_ERROR_HIDE, newsErrors.FAILED_TO_HIDE);
    },
    [hideMutate]
  );

  const deleteNews = useCallback(
    async (variables: DeleteNewsMutationVariables) => {
      return safeMutate(deleteMutate, variables, newsErrors.NETWORK_ERROR_DELETE, newsErrors.FAILED_TO_DELETE);
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
