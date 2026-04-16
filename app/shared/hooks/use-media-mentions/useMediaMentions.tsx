import { FetchResult } from '@apollo/client';
import { useCallback } from 'react';

import { buildStatusUpdater } from '../buildStatusUpdater';
import {
  CreateMediaMentionInput,
  MediaMentionsCountQueryVariables,
  MediaMentionsFiltersInput,
  MediaStatus,
  UpdateMediaMentionInput,
  UpdateMediaMentionMutation,
  useAddMediaMentionViewMutation,
  useAllMediaMentionsQuery,
  useCreateMediaMentionMutation,
  useDeleteMediaMentionMutation,
  useMediaMentionsCountQuery,
  usePaginatedMediaMentionsQuery,
  usePublishedMediaMentionsQuery,
  useUpdateMediaMentionMutation
} from '~/types/graphql/generated/graphql';

type QueryHookOptions = Readonly<{
  skip?: boolean;
}>;

// We should discuss on cache policy
export const useAllMediaMentions = (filters?: MediaMentionsFiltersInput, options: QueryHookOptions = {}) => {
  return useAllMediaMentionsQuery({
    variables: { filters },
    fetchPolicy: 'network-only',
    skip: options.skip
  });
};

export const usePublishedMediaMentions = (filters?: MediaMentionsFiltersInput, options: QueryHookOptions = {}) => {
  return usePublishedMediaMentionsQuery({
    variables: { filters },
    fetchPolicy: 'cache-first',
    skip: options.skip
  });
};

export const usePaginatedMediaMentions = (page = 1, limit = 10, opts?: MediaMentionsFiltersInput) => {
  return usePaginatedMediaMentionsQuery({ variables: { page, limit, ...opts }, fetchPolicy: 'network-only' });
};

export const useMediaMentionsCount = (status?: MediaStatus) => {
  return useMediaMentionsCountQuery({
    variables: { status } as MediaMentionsCountQueryVariables,
    fetchPolicy: 'network-only'
  });
};

export const useCreateMediaMention = () => {
  const [mutate, meta] = useCreateMediaMentionMutation();

  const createMediaMention = useCallback(
    async (input: CreateMediaMentionInput) => mutate({ variables: { input } }),
    [mutate]
  );

  return [createMediaMention, meta] as const;
};

export const useDeleteMediaMention = () => {
  const [mutate, meta] = useDeleteMediaMentionMutation();
  const deleteMediaMention = useCallback(async (id: string) => mutate({ variables: { id } }), [mutate]);
  return [deleteMediaMention, meta] as const;
};

export const useUpdateMediaMention = () => {
  const [mutate, meta] = useUpdateMediaMentionMutation();
  const updateMediaMention = useCallback(
    async (id: string, input: UpdateMediaMentionInput) => mutate({ variables: { id, input } }),
    [mutate]
  );
  return [updateMediaMention, meta] as const;
};

export const useUpdateMediaMentionStatus = (): [
  Record<
    string,
    (id: string, input?: { publishedAt?: string | null }) => Promise<FetchResult<UpdateMediaMentionMutation>>
  >,
  { status?: MediaStatus; loading: boolean; error?: Error }
] => {
  const [mutate, { data, loading, error }] = useUpdateMediaMentionMutation();
  const status = data?.updateMediaMention.status; // Placeholder for current status

  const makeStatusUpdater = useCallback(
    buildStatusUpdater(mutate, MediaStatus.Published),
    [mutate]
  );

  return [
    {
      publish: makeStatusUpdater(MediaStatus.Published),
      hide: makeStatusUpdater(MediaStatus.Hidden),
      draft: makeStatusUpdater(MediaStatus.Draft),
      archive: makeStatusUpdater(MediaStatus.Archived)
    },
    { status, loading, error }
  ] as const;
};

export const useAddMediaMentionView = () => {
  const [mutate, meta] = useAddMediaMentionViewMutation();
  const addViews = useCallback(async (id: string) => mutate({ variables: { id } }), [mutate]);
  return [addViews, meta] as const;
};
