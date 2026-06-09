'use client';


import { EditBlockSkeleton } from '../../edit-block-skeleton/EditBlockSkeleton';
import { EditDescriptionListNoteBlock } from '../components/edit-description-list-note-block/EditDescriptionListNoteBlock';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';

export const GoogleAuth = () => {
  const blockId = BLOCK_IDS.GOOGLE_AUTH;
  const title = 'Авторизація через Google-акаунт';
  
  const { block } = usePageBlock(PAGE_IDS.PRIVACY_POLICY, blockId);
  if (!block) return <EditBlockSkeleton />;

  return (
    <EditDescriptionListNoteBlock
      blockId={BLOCK_IDS.GOOGLE_AUTH}
      title={title}
      listFieldName="list"
      block={block}
    />
  );
};
