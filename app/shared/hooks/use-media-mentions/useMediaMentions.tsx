import { useCallback } from 'react';

import {
  AllMediaMentionsQueryVariables,
  MediaMentionsCountQueryVariables,
  MediaMentionsFiltersInput,
  MediaStatus,
  UpdateMediaMentionInput,
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
  const [mutate, { loading }] = useCreateMediaMentionMutation();
  const createMediaMention = useCallback(async (url: string) => mutate({ variables: { input: { url } } }), [mutate]);
  return [createMediaMention, { loading }];
};

export const useDeleteMediaMention = () => {
  const [mutate, { loading }] = useDeleteMediaMentionMutation();
  const deleteMediaMention = useCallback(async (id: string) => mutate({ variables: { id } }), [mutate]);
  return [deleteMediaMention, { loading }];
};

export const useUpdateMediaMention = () => {
  const [mutate, { loading }] = useUpdateMediaMentionMutation();
  const updateMediaMention = useCallback(
    async (id: string, input: UpdateMediaMentionInput) => mutate({ variables: { id, input } }),
    [mutate]
  );
  return [updateMediaMention, { loading }];
};

// TODO: add current status as exported member to indicate current status in the UI
export const useUpdateMediaMentionStatus = () => {
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
    status,
    {
      publish: makeStatusUpdater(MediaStatus.Published),
      hide: makeStatusUpdater(MediaStatus.Hidden),
      draft: makeStatusUpdater(MediaStatus.Draft),
      archive: makeStatusUpdater(MediaStatus.Archived)
    },
    { loading, error }
  ];
};

export const useAddMediaMentionView = () => {
  const [mutate, { loading }] = useAddMediaMentionViewMutation();
  const addViews = useCallback(async (id: string) => mutate({ variables: { id } }), [mutate]);
  return [addViews, { loading }];
};
