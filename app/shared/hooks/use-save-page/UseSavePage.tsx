'use client';
import { ApolloError } from '@apollo/client';

import { useStore } from '~/store';
import { type PublishPageMutationVariables, usePublishPageMutation } from '~/types/graphql/generated/graphql';

export const useSavePageBlocks = (pageSlug: string) => {
  const pageBlocks = useStore((s) => s.blocks[pageSlug]);
  const isChanged = useStore((s) => s.isChanged);
  const markSaved = useStore((s) => s.saveAsDraft);

  const [mutate, { loading, error, data }] = usePublishPageMutation();

  const save = async () => {
    if (!pageBlocks) throw new Error('No page blocks found');
    if (!isChanged) throw new Error('Nothing to publish');

    const variables: PublishPageMutationVariables = { input: { slug: pageSlug, blocks: pageBlocks } };

    const res = await mutate({ variables }).catch((e: unknown) => {
      if (e instanceof ApolloError) {
        const msg = e.graphQLErrors[0]?.message ?? (e.networkError ? 'Network error while publishing' : e.message);
        throw new Error(msg);
      }
      throw new Error('Failed to publish page');
    });

    if (!res?.data?.publishPage) throw new Error('Server did not return published page');

    markSaved(pageSlug);
    return res.data.publishPage;
  };

  return { save, loading, error, data, isChanged };
};
