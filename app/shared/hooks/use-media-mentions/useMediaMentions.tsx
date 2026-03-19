import { FetchResult } from '@apollo/client';
import { useCallback } from 'react';

import {
  AllMediaMentionsQueryVariables,
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
  useUpdateMediaMentionMutation
} from '~/types/graphql/generated/graphql';

// We should discuss on cache policy
export const useAllMediaMentions = (status?: MediaStatus) => {
  return useAllMediaMentionsQuery({
    variables: { status } as AllMediaMentionsQueryVariables,
    fetchPolicy: 'network-only'
  });
};

export const usePublishedMediaMentions = () => {
  return useAllMediaMentionsQuery({
    variables: { status: MediaStatus.Published } as AllMediaMentionsQueryVariables,
    fetchPolicy: 'cache-first'
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
    (status: MediaStatus) => {
      return async (id: string, input?: { publishedAt?: string | null }) => {
        const payload: UpdateMediaMentionInput = { status };
        if (status === MediaStatus.Published) {
          payload.publishedAt = input?.publishedAt ?? new Date().toISOString();
        }
        return mutate({ variables: { id, input: payload } });
      };
    },
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
