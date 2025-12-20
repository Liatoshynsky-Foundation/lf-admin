'use client';

import { useCallback } from 'react';

import { newsErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import {
  type CreateNewsInput,
  type CreateNewsMutation,
  type CreateNewsMutationVariables,
  type DeleteNewsMutationVariables,
  NewsFiltersInput,
  NewsStatus,
  type UpdateNewsInput,
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

export const useAllNews = (filters?: NewsFiltersInput) =>
  useAllNewsQuery({ variables: { filters }, fetchPolicy: 'network-only' });

export const usePublishedNews = (filters?: NewsFiltersInput) =>
  usePublishedNewsQuery({ variables: { filters }, fetchPolicy: 'cache-first' });

export const usePaginatedNews = (page = 1, limit = 10, filters?: NewsFiltersInput) =>
  usePaginatedNewsQuery({ variables: { page, limit, filters }, fetchPolicy: 'network-only' });

export const useNewsCount = (status?: NewsStatus) => useNewsCountQuery({ variables: { status } });

export const useCreateNews = () => {
  const [mutate, { loading }] = useCreateNewsMutation();
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
  return [createNews, { loading }];
};

export const useUpdateNews = () => {
  const [mutate, { loading }] = useUpdateNewsMutation();
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
  return [updateNews, { loading }];
};

export const useUpdateNewsStatus = () => {
  const [mutate, { loading, data, error }] = useUpdateNewsMutation();
  const status = data?.updateNews.status; // Placeholder for current status

  const makeStatusUpdater = useCallback(
    (status: NewsStatus) => {
      return async (id: string, input?: { publishedAt?: string | null }) => {
        const payload: UpdateNewsInput = { status };
        if (status === NewsStatus.Published) {
          payload.publishedAt = input?.publishedAt ?? new Date().toISOString();
        }
        return mutate({ variables: { id, input: payload } });
      };
    },
    [mutate]
  );

  return [
    status,
    {
      publish: makeStatusUpdater(NewsStatus.Published),
      unpublish: makeStatusUpdater(NewsStatus.Draft),
      archive: makeStatusUpdater(NewsStatus.Archived),
      hide: makeStatusUpdater(NewsStatus.Hidden)
    },
    { loading, error }
  ];
};

export const useDeleteNews = () => {
  const [mutate, { loading }] = useDeleteNewsMutation();
  const deleteNews = useCallback(
    async (variables: DeleteNewsMutationVariables) =>
      safeMutate(mutate, variables, newsErrors.NETWORK_ERROR_DELETE, newsErrors.FAILED_TO_DELETE),
    [mutate]
  );
  return [deleteNews, { loading }];
};

export const useIncrementNewsViews = () => {
  const [mutate, { loading }] = useIncrementNewsViewsMutation();
  const incrementViews = useCallback(async (id: string) => mutate({ variables: { id } }), [mutate]);
  return [incrementViews, { loading }];
};
