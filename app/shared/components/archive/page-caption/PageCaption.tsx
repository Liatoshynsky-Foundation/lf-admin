'use client';

import { Box } from '@mui/material';

import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { useBlockFieldHandlers } from '~/shared/hooks/use-block-field-handlers/useBlockFieldHandlers';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

export const PageCaption = () => {
  const pageId = PAGE_IDS.ARCHIVE;
  const blockId = BLOCK_IDS.PAGE_CAPTION;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale) as 'uk' | 'en';

  const { handleDescriptionChange } = useBlockFieldHandlers(
    pageId,
    blockId,
    currentLocale,
    block
  );

  if (!block) return <EditBlockSkeleton />;

  return (
    <CollapsibleBlock title="Деталі">
      <Box>
        <CustomTextField
          fieldType="formatting"
          label="Вступне слово"
          value={block.description?.[currentLocale] ?? undefined}
          onChange={handleDescriptionChange}
        />
      </Box>
    </CollapsibleBlock>
  );
};