import { useCallback } from 'react';

import { MediaMentionsErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import {
  AllMediaMentionsQueryVariables,
  CreateMediaMentionMutationVariables,
  DeleteMediaMentionMutationVariables,
  MediaMentionsCountQueryVariables,
  PaginatedMediaMentionsQueryVariables,
  PublishedMediaMentionsQueryVariables,
  useAddMediaMentionViewMutation,
  useAllMediaMentionsQuery,
  useCreateMediaMentionMutation,
  useDeleteMediaMentionMutation,
  useMediaMentionsCountQuery,
  usePaginatedMediaMentionsQuery,
  usePublishedMediaMentionsQuery,
  usePublishMediaMentionMutation,
  useUnpublishMediaMentionMutation
} from '~/types/graphql/generated/graphql';

export const useMediaMentionsQuery = () => {
  const useAllMediaMentions = (variables?: AllMediaMentionsQueryVariables) => {
    return useAllMediaMentionsQuery({ variables, fetchPolicy: 'network-only' });
  };

  const usePublishedMediaMentions = (variables?: PublishedMediaMentionsQueryVariables) => {
    return usePublishedMediaMentionsQuery({ variables, fetchPolicy: 'cache-first' });
  };

  const usePaginatedMediaMentions = (variables?: PaginatedMediaMentionsQueryVariables) => {
    return usePaginatedMediaMentionsQuery({ variables, fetchPolicy: 'network-only' });
  };

  const useMediaMentionsCount = (variables?: MediaMentionsCountQueryVariables) => {
    return useMediaMentionsCountQuery({ variables });
  };

  return {
    useAllMediaMentions,
    usePublishedMediaMentions,
    usePaginatedMediaMentions,
    useMediaMentionsCount
  };
};

export const useMediaMentionsMutations = () => {
  const [createMutate, { loading: creating }] = useCreateMediaMentionMutation();
  const [publishMutate, { loading: publishing }] = usePublishMediaMentionMutation();
  const [unpublishMutate, { loading: unpublishing }] = useUnpublishMediaMentionMutation();
  const [deleteMutate, { loading: deleting }] = useDeleteMediaMentionMutation();
  const [addViewMutate, { loading: addingView }] = useAddMediaMentionViewMutation();

  const createMediaMentions = useCallback(
    async (variables: CreateMediaMentionMutationVariables) => {
      return safeMutate(
        createMutate,
        variables,
        MediaMentionsErrors.NETWORK_ERROR_CREATE,
        MediaMentionsErrors.FAILED_TO_CREATE
      );
    },
    [createMutate]
  );

  const publishMediaMentions = useCallback(
    async (id: string) => {
      return safeMutate(
        publishMutate,
        { id },
        MediaMentionsErrors.NETWORK_ERROR_PUBLISH,
        MediaMentionsErrors.FAILED_TO_PUBLISH
      );
    },
    [publishMutate]
  );

  const unpublishMediaMentions = useCallback(
    async (id: string) => {
      return safeMutate(
        unpublishMutate,
        { id },
        MediaMentionsErrors.NETWORK_ERROR_UNPUBLISH,
        MediaMentionsErrors.FAILED_TO_UNPUBLISH
      );
    },
    [unpublishMutate]
  );

  const deleteMediaMentions = useCallback(
    async (variables: DeleteMediaMentionMutationVariables) => {
      return safeMutate(
        deleteMutate,
        variables,
        MediaMentionsErrors.NETWORK_ERROR_DELETE,
        MediaMentionsErrors.FAILED_TO_DELETE
      );
    },
    [deleteMutate]
  );

  const addViews = useCallback(
    async (id: string) => {
      return safeMutate(
        addViewMutate,
        { id },
        MediaMentionsErrors.NETWORK_ERROR_UPDATE,
        MediaMentionsErrors.FAILED_TO_UPDATE
      );
    },
    [addViewMutate]
  );

  return {
    createMediaMentions,
    publishMediaMentions,
    unpublishMediaMentions,
    deleteMediaMentions,
    addViews,
    loading: creating || publishing || unpublishing || deleting || addingView
  };
};
