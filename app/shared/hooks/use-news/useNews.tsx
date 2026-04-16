'use client';

import { useCallback } from 'react';

import { buildStatusUpdater } from '../buildStatusUpdater';
import { newsErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import {
  type CreateNewsInput,
  type CreateNewsMutation,
  type CreateNewsMutationVariables,
  type DeleteNewsMutationVariables,
  NewsFiltersInput,
  NewsStatus,
  type UpdateNewsMutation,
  type UpdateNewsMutationVariables,
  useAllNewsQuery,
  useCreateNewsMutation,
  useDeleteNewsMutation,
  useIncrementNewsViewsMutation,
  useNewsCountQuery,
  usePaginatedNewsQuery,
  usePublishedNewsQuery,
  useUpdateNewsMutation
} from '~/types/graphql/generated/graphql';

type QueryHookOptions = Readonly<{
  skip?: boolean;
}>;

export const useAllNews = (filters?: NewsFiltersInput, options: QueryHookOptions = {}) =>
  useAllNewsQuery({ variables: { filters }, fetchPolicy: 'network-only', skip: options.skip });

export const usePublishedNews = (filters?: NewsFiltersInput, options: QueryHookOptions = {}) =>
  usePublishedNewsQuery({ variables: { filters }, fetchPolicy: 'cache-first', skip: options.skip });

export const usePaginatedNews = (page = 1, limit = 10, filters?: NewsFiltersInput) =>
  usePaginatedNewsQuery({ variables: { page, limit, filters }, fetchPolicy: 'network-only' });

export const useNewsCount = (status?: NewsStatus) => useNewsCountQuery({ variables: { status } });

export const useCreateNews = () => {
  const [mutate, meta] = useCreateNewsMutation();
  const createNews = useCallback(
    async (news: CreateNewsInput) =>
      safeMutate<CreateNewsMutation, CreateNewsMutationVariables>(
        mutate,
        { input: news },
        newsErrors.NETWORK_ERROR_CREATE,
        newsErrors.FAILED_TO_CREATE
      ),
    [mutate]
  );
  return [createNews, meta] as const;
};

export const useUpdateNews = () => {
  const [mutate, meta] = useUpdateNewsMutation();
  const updateNews = useCallback(
    async (variables: UpdateNewsMutationVariables) =>
      safeMutate<UpdateNewsMutation, UpdateNewsMutationVariables>(
        mutate,
        variables,
        newsErrors.NETWORK_ERROR_UPDATE,
        newsErrors.FAILED_TO_UPDATE
      ),
    [mutate]
  );
  return [updateNews, meta] as const;
};

export const useUpdateNewsStatus = () => {
  const [mutate, { loading, data, error }] = useUpdateNewsMutation();
  const status = data?.updateNews.status; // Placeholder for current status

  const makeStatusUpdater = useCallback(
    buildStatusUpdater(mutate, NewsStatus.Published),
    [mutate]
  );

  return [
    {
      publish: makeStatusUpdater(NewsStatus.Published),
      unpublish: makeStatusUpdater(NewsStatus.Draft),
      archive: makeStatusUpdater(NewsStatus.Archived),
      hide: makeStatusUpdater(NewsStatus.Hidden)
    },
    { status, loading, error }
  ] as const;
};

export const useDeleteNews = () => {
  const [mutate, meta] = useDeleteNewsMutation();
  const deleteNews = useCallback(
    async (variables: DeleteNewsMutationVariables) =>
      safeMutate(mutate, variables, newsErrors.NETWORK_ERROR_DELETE, newsErrors.FAILED_TO_DELETE),
    [mutate]
  );
  return [deleteNews, meta] as const;
};

export const useIncrementNewsViews = () => {
  const [mutate, meta] = useIncrementNewsViewsMutation();
  const incrementViews = useCallback(async (id: string) => mutate({ variables: { id } }), [mutate]);
  return [incrementViews, meta] as const;
};
