import { FetchResult } from '@apollo/client';
import { useCallback } from 'react';

import {
  AddMediaMentionViewMutation,
  AllMediaMentionsQueryResult,
  AllMediaMentionsQueryVariables,
  CreateMediaMentionMutation,
  DeleteMediaMentionMutation,
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

// simpler, explicit hook result types for clarity
export type SimpleQueryResult<TData = unknown> = {
  data?: TData | null;
  loading: boolean;
  error?: Error | null;
  refetch?: () => Promise<AllMediaMentionsQueryResult>;
};

export type MutationTuple<Args extends unknown[] = unknown[], TResult = unknown> = [
  (...args: Args) => Promise<FetchResult<TResult>>,
  { loading: boolean; error?: Error | null }
];

export type StatusUpdater = (
  id: string,
  input?: { publishedAt?: string | null }
) => Promise<FetchResult<UpdateMediaMentionMutation>>;
export type MediaStatusActions = {
  publish: StatusUpdater;
  hide: StatusUpdater;
  draft: StatusUpdater;
  archive: StatusUpdater;
};

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

export const useCreateMediaMention = (): MutationTuple<[string], CreateMediaMentionMutation> => {
  const [mutate, { loading }] = useCreateMediaMentionMutation();
  const createMediaMention = useCallback(async (url: string) => mutate({ variables: { input: { url } } }), [mutate]);
  return [createMediaMention, { loading }];
};

export const useDeleteMediaMention = (): MutationTuple<[string], DeleteMediaMentionMutation> => {
  const [mutate, { loading }] = useDeleteMediaMentionMutation();
  const deleteMediaMention = useCallback(async (id: string) => mutate({ variables: { id } }), [mutate]);
  return [deleteMediaMention, { loading }];
};

export const useUpdateMediaMention = (): MutationTuple<
  [string, UpdateMediaMentionInput],
  UpdateMediaMentionMutation
> => {
  const [mutate, { loading }] = useUpdateMediaMentionMutation();
  const updateMediaMention = useCallback(
    async (id: string, input: UpdateMediaMentionInput) => mutate({ variables: { id, input } }),
    [mutate]
  );
  return [updateMediaMention, { loading }];
};

// TODO: add current status as exported member to indicate current status in the UI
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
  ];
};

export const useAddMediaMentionView = (): MutationTuple<[string], AddMediaMentionViewMutation> => {
  const [mutate, { loading }] = useAddMediaMentionViewMutation();
  const addViews = useCallback(async (id: string) => mutate({ variables: { id } }), [mutate]);
  return [addViews, { loading }];
};
