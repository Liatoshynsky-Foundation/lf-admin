'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';

import { ConfigurableButtonList } from '../ConfigurableButtonList/ConfigurableButtonList';
import { styles } from './YermolenkoLinks.styles';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { useBlockFieldHandlers } from '~/shared/hooks/use-block-field-handlers/useBlockFieldHandlers';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

export const YermolenkoLinks = () => {
  const pageId = PAGE_IDS.WAR_IN_UKRAINE;
  const blockId = BLOCK_IDS.YERMOLENKO_LINKS;

  const { block } = usePageBlock(pageId, blockId);

  const currentLocale = useStore((state) => state.locale) as 'uk' | 'en';
  const setField = useStore((state) => state.setField);
  const toggleBlockVisibility = useStore((state) => state.toggleBlockVisibility);

  const { handleLocalizedTextChange, handleDescriptionChange } = useBlockFieldHandlers(
    pageId, 
    blockId, 
    currentLocale, 
    block
  );

  if (!block) return <EditBlockSkeleton />;

  return (
    <CollapsibleBlock
      title="Блок підтримки (В. Єрмоленко)"
      grip
      hidden={block.hidden}
      onToggleVisibility={() => toggleBlockVisibility(pageId, blockId)}
    >
      <Box sx={styles.fieldsWrapper}>
        <Typography sx={styles.sectionTitle}>Головна інформація</Typography>

        <CustomTextField
          fieldType="formatting"
          title="Опис"
          label="Текст опису"
          value={block.description?.[currentLocale]}
          onChange={handleDescriptionChange}
        />

        <CustomTextField
          title="Текст заголовка / кнопки"
          label="Наприклад: Підтримати"
          value={block.buttonText?.[currentLocale] || ''}
          onChange={handleLocalizedTextChange('buttonText')}
          fullWidth
        />

        <ConfigurableButtonList
          buttons={block.buttons || []}
          currentLocale={currentLocale}
          title="Кнопки посилань"
          addBtnLabel="Додати посилання"
          onChange={(newList) => setField(pageId, blockId, 'buttons', newList)}
        />
      </Box>
    </CollapsibleBlock>
  );
};
