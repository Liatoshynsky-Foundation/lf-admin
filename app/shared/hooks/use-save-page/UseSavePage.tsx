'use client';
import { useMutation } from '@apollo/client';

import { UPDATE_PAGE_BLOCKS } from '~/back-shared/graphql/mutations/updatePageBlock';
import { useStore } from '~/store';

export const useSavePageBlocks = (pageSlug: string) => {
  const pageBlocks = useStore((state) => state.blocks[pageSlug]);
  const isChanged = useStore((state) => state.isChanged);
  const markSaved = useStore((state) => state.saveAsDraft);

  const [mutate, { loading, error, data }] = useMutation(UPDATE_PAGE_BLOCKS);

  const save = async () => {
    if (!pageBlocks) throw new Error('No page blocks found');
    if (!isChanged) throw new Error('Nothing to save');

    const res = await mutate({
      variables: { input: { slug: pageSlug, blocks: pageBlocks } }
    }).catch(() => {
      throw new Error('Failed to save page blocks');
    });

    if (!res?.data?.updatePageBlocks) {
      throw new Error('Server did not return updated page');
    }

    markSaved(pageSlug);
    return res.data.updatePageBlocks;
  };

  return { save, loading, error, data, isChanged };
};
