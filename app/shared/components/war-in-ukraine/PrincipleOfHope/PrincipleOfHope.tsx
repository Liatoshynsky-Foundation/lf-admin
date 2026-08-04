'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';

import { ConfigurableButtonList } from '../ConfigurableButtonList/ConfigurableButtonList';
import { styles } from './PrincipleOfHope.styles';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { useBlockFieldHandlers } from '~/shared/hooks/use-block-field-handlers/useBlockFieldHandlers';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { getEventValue } from '~/src/shared/utils/formHelpers';
import { useStore } from '~/store';

export const PrincipleOfHope = () => {
  const pageId = PAGE_IDS.WAR_IN_UKRAINE;
  const blockId = BLOCK_IDS.PRINCIPLE_OF_HOPE;

  const { block } = usePageBlock(pageId, blockId);

  const currentLocale = useStore((state) => state.locale) as 'uk' | 'en';
  const setField = useStore((state) => state.setField);

  const { handleLocalizedTextChange, handleDescriptionChange } = useBlockFieldHandlers(
    pageId,
    blockId,
    currentLocale,
    block
  );

  if (!block) return <EditBlockSkeleton />;

  const handleLinkChange = (e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setField(pageId, blockId, 'buttonLink', getEventValue(e));
  };

  return (
    <CollapsibleBlock 
      title="Блок «Принцип надії»" 
      grip 
      hidden={block.hidden} 
      onToggleVisibility={() => setField(pageId, blockId, 'hidden', !block.hidden)}
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
          title="Текст головної кнопки"
          label="Текст"
          value={block.buttonText?.[currentLocale] || ''}
          onChange={handleLocalizedTextChange('buttonText')}
          fullWidth
        />

        <CustomTextField
          title="Посилання головної кнопки (URL)"
          label="Посилання"
          value={block.buttonLink || ''}
          onChange={handleLinkChange}
          fullWidth
        />
        
        <ConfigurableButtonList
          buttons={block.buttons || []}
          currentLocale={currentLocale}
          title="Додаткові кнопки"
          addBtnLabel="Додати кнопку"
          onChange={(newList) => setField(pageId, blockId, 'buttons', newList)}
        />
      </Box>
    </CollapsibleBlock>
  );
};