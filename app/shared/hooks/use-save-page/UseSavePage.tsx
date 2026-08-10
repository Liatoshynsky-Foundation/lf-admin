'use client';
import { useApolloClient } from '@apollo/client';
import toast from 'react-hot-toast';

import { TOAST_MESSAGES } from '~/constants';
import { safeMutate } from '~/lib/utils/safeMutate';
import { useStore } from '~/store';
import {
  GetPageDocument,
  type GetPageQuery,
  type GetPageQueryVariables,
  type PublishPageMutation,
  type PublishPageMutationVariables,
  type UpsertPageDraftMutation,
  type UpsertPageDraftMutationVariables,
  usePublishPageMutation,
  useUpsertPageDraftMutation
} from '~/types/graphql/generated/graphql';

export const useSavePageBlocks = (slug: string, blockIdToPublish?: string) => {
  const markSaved = useStore((s) => s.saveAsDraft);
  const client = useApolloClient();

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

    let blocksToPublish = current;
    let blocksOrderToPublish = currentBlocksOrder;

    if (blocksOrderToPublish.includes('founders') && blocksOrderToPublish.includes('FoundationFounders')) {
      blocksOrderToPublish = blocksOrderToPublish.filter((id: string) => id !== 'FoundationFounders');
    }

    if (blockIdToPublish) {
      const { data } = await client.query<GetPageQuery, GetPageQueryVariables>({
        query: GetPageDocument,
        variables: { slug },
        fetchPolicy: 'network-only'
      });

      const publishedBlocks = data.pageBlocks?.blocks || {};
      let publishedBlocksOrder = data.pageBlocks?.blocksOrder || currentBlocksOrder;

      if (publishedBlocksOrder.includes('founders') && publishedBlocksOrder.includes('FoundationFounders')) {
        publishedBlocksOrder = publishedBlocksOrder.filter((id: string) => id !== 'FoundationFounders');
      }

      blocksToPublish = {
        ...publishedBlocks,
        [blockIdToPublish]: (current as Record<string, any>)[blockIdToPublish]
      };

      blocksOrderToPublish = publishedBlocksOrder;
      const isDuplicateFounders = blockIdToPublish === 'FoundationFounders' && blocksOrderToPublish.includes('founders');
      
      if (!blocksOrderToPublish.includes(blockIdToPublish) && !isDuplicateFounders) {
        blocksOrderToPublish = [...blocksOrderToPublish, blockIdToPublish];
      }
    }

    const response = await safeMutate<PublishPageMutation, PublishPageMutationVariables>(
      publishMutate,
      { input: { slug, blocks: blocksToPublish, blocksOrder: blocksOrderToPublish } },
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
