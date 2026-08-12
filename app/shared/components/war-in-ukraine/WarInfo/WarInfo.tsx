'use client';

import { Box } from '@mui/material';
import React from 'react';

import { styles } from './WarInfo.styles';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { useBlockFieldHandlers } from '~/shared/hooks/use-block-field-handlers/useBlockFieldHandlers';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

export const WarInfo = () => {
  const pageId = PAGE_IDS.WAR_IN_UKRAINE;
  const blockId = BLOCK_IDS.WAR_INFO;

  const { block } = usePageBlock(pageId, blockId);

  const currentLocale = useStore((state) => state.locale) as 'uk' | 'en';

  const { handleLocalizedTextChange, handleDescriptionChange } = useBlockFieldHandlers(
    pageId,
    blockId,
    currentLocale,
    block
  );

  if (!block) return <EditBlockSkeleton />;

  return (
    <CollapsibleBlock title="Війна в Україні та наша позиція">
      <Box sx={styles.fieldsWrapper}>
        <CustomTextField
          title="Заголовок блоку"
          label="Текст заголовку"
          value={block.title?.[currentLocale] || ''}
          onChange={handleLocalizedTextChange('title')}
          fullWidth
        />

        <CustomTextField
          fieldType="formatting"
          title="Опис блоку"
          label="Текст опису"
          value={block.description?.[currentLocale]}
          onChange={handleDescriptionChange}
        />
      </Box>
    </CollapsibleBlock>
  );
};