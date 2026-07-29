'use client';

import { Box, Typography } from '@mui/material';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { ConfigurableButtonList } from '../ConfigurableButtonList/ConfigurableButtonList';
import { styles } from './PrincipleOfHope.styles';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

export const PrincipleOfHope = () => {
  const pageId = PAGE_IDS.WAR_IN_UKRAINE;
  const blockId = BLOCK_IDS.PRINCIPLE_OF_HOPE;

  const { block } = usePageBlock(pageId, blockId);

  const currentLocale = useStore((state) => state.locale) as 'uk' | 'en';
  const setField = useStore((state) => state.setField);

  if (!block) return <EditBlockSkeleton />;

  const handleTextChange = (field: 'buttonText' | 'buttonLink', e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const textValue = typeof e === 'string' ? e : e?.target?.value || '';
    
    if (field === 'buttonLink') {
      setField(pageId, blockId, field, textValue);
      return;
    }

    setField(pageId, blockId, field, {
      uk: block[field]?.uk || '',
      en: block[field]?.en || '',
      [currentLocale]: textValue
    });
  };

  const handleDescriptionChange = (val: JSONContent) => {
    setField(pageId, blockId, 'description', {
      ...(block.description || {}),
      [currentLocale]: val
    });
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
          onChange={(e) => handleTextChange('buttonText', e)}
          fullWidth
        />

        <CustomTextField
          title="Посилання головної кнопки (URL)"
          label="Посилання"
          value={block.buttonLink || ''}
          onChange={(e) => handleTextChange('buttonLink', e)}
          fullWidth
        />

        {/* --- ВИКОРИСТОВУЄМО СПІЛЬНИЙ КОМПОНЕНТ --- */}
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