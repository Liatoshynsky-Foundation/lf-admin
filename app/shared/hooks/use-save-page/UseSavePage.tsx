'use client';
import { ApolloError } from '@apollo/client';
import isEqual from 'fast-deep-equal';

import { useStore } from '~/store';
import {
  type PublishPageMutationVariables,
  type UpsertPageDraftMutationVariables,
  usePublishPageMutation,
  useUpsertPageDraftMutation
} from '~/types/graphql/generated/graphql';

export const useSavePageBlocks = (pageSlug: string) => {
  const markSaved = useStore((s) => s.saveAsDraft);

  const [upsertDraft, upsertState] = useUpsertPageDraftMutation();
  const [publishMutate, publishState] = usePublishPageMutation();

  const save = async () => {
    const state = useStore.getState();
    const current = state.blocks[pageSlug];
    const baseline = state.originalBlocks?.[pageSlug];

    if (current == null) throw new Error('No page blocks found');

    const changedNow = baseline === undefined ? true : current !== baseline && !isEqual(current, baseline);

    if (!changedNow) throw new Error('Nothing to save');

    try {
      const upsertVars: UpsertPageDraftMutationVariables = {
        input: { slug: pageSlug, blocks: current }
      };
      await upsertDraft({ variables: upsertVars });
    } catch (e) {
      if (e instanceof ApolloError) {
        const msg = e.graphQLErrors[0]?.message ?? (e.networkError ? 'Network error while saving draft' : e.message);
        throw new Error(msg);
      }
      throw new Error('Failed to save draft');
    }

    try {
      const publishVars: PublishPageMutationVariables = {
        input: { slug: pageSlug, blocks: current }
      };
      const res = await publishMutate({ variables: publishVars });
      if (!res?.data?.publishPage) throw new Error('Server did not return published page');
      markSaved(pageSlug);
      return res.data.publishPage;
    } catch (e) {
      if (e instanceof ApolloError) {
        const msg = e.graphQLErrors[0]?.message ?? (e.networkError ? 'Network error while publishing' : e.message);
        throw new Error(msg);
      }
      throw new Error('Failed to publish page');
    }
  };

  return {
    save,
    loading: upsertState.loading || publishState.loading,
    error: upsertState.error ?? publishState.error,
    data: publishState.data
  };
};
