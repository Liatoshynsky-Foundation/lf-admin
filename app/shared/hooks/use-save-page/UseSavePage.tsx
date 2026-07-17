'use client';
import toast from 'react-hot-toast';

import { TOAST_MESSAGES } from '~/constants';
import { safeMutate } from '~/lib/utils/safeMutate';
import { useStore } from '~/store';
import {
  type PublishPageMutation,
  type PublishPageMutationVariables,
  type UpsertPageDraftMutation,
  type UpsertPageDraftMutationVariables,
  usePublishPageMutation,
  useUpsertPageDraftMutation
} from '~/types/graphql/generated/graphql';

export const useSavePageBlocks = (slug: string) => {
  const markSaved = useStore((s) => s.saveAsDraft);

  const [upsertDraft, upsertState] = useUpsertPageDraftMutation();
  const [publishMutate, publishState] = usePublishPageMutation();

  const save = async () => {
    const state = useStore.getState();

    const current = state.blocks[slug];

    const currentBlocksOrder = state.blocksOrder[slug];

    if (current == null) throw new Error('No page blocks found');
    await safeMutate<UpsertPageDraftMutation, UpsertPageDraftMutationVariables>(
      upsertDraft,
      { input: { slug, blocks: current, blocksOrder: currentBlocksOrder } },
      'Network error while saving draft',
      'Failed to save draft'
    );

    const response = await safeMutate<PublishPageMutation, PublishPageMutationVariables>(
      publishMutate,
      { input: { slug, blocks: current, blocksOrder: currentBlocksOrder } },
      'Network error while publishing',
      'Failed to publish page'
    );

    const published = response.data?.publishPage;
    if (!published) throw new Error('Server did not return published page');

    markSaved(slug);
    toast.success(TOAST_MESSAGES.SUCCESS_SAVE_DATA);
    return published;
  };

  return {
    save,
    loading: upsertState.loading || publishState.loading,
    error: upsertState.error ?? publishState.error,
    data: publishState.data
  };
};
