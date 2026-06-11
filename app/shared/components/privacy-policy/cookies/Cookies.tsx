'use client';

import React from 'react';

import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { EditDescriptionListNoteBlock } from '../components/edit-description-list-note-block/EditDescriptionListNoteBlock';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';

export const Cookies = () => {
  const blockId = BLOCK_IDS.COOKIES;
  const title = 'Які cookie ми використовуємо';
  
  const { block } = usePageBlock(PAGE_IDS.PRIVACY_POLICY, blockId);
  if (!block) return <EditBlockSkeleton />;

  return (
    <EditDescriptionListNoteBlock
      blockId={BLOCK_IDS.COOKIES}
      title={title}
      listFieldName="list"
      block={block}
    />
  );
};
