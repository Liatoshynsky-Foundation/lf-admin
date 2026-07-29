'use client';

import { Box, Typography } from '@mui/material';
import { JSONContent } from '@tiptap/react';
import React, { useMemo } from 'react';

import { PrincipleHopeButtonCard } from '../PrincipleHopeButtonCard/PrincipleHopeButtonCard';
import { styles } from './PrincipleOfHope.styles';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

export type PrincipleHopeButtonData = {
  id: string;
  shortText: Record<'uk' | 'en', string>;
  fullText: Record<'uk' | 'en', string>;
  link: string;
};

export const PrincipleOfHope = () => {
  const pageId = PAGE_IDS.WAR_IN_UKRAINE;
  const blockId = BLOCK_IDS.PRINCIPLE_OF_HOPE;

  const { block } = usePageBlock(pageId, blockId);

  const currentLocale = useStore((state) => state.locale) as 'uk' | 'en';
  const setField = useStore((state) => state.setField);

  const buttonsList = useMemo(() => {
    const rawButtons = block?.buttons || [];
    return rawButtons.map((btn: Partial<PrincipleHopeButtonData>, index: number) => ({
      ...btn,
      shortText: btn.shortText || { uk: '', en: '' },
      fullText: btn.fullText || { uk: '', en: '' },
      link: btn.link || '',
      id: btn.id || `btn-${index}-${crypto.randomUUID()}`
    })) as PrincipleHopeButtonData[];
  }, [block?.buttons]);

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

  const updateButtonsList = (newList: PrincipleHopeButtonData[]) => {
    setField(pageId, blockId, 'buttons', newList);
  };

  const handleAddButton = () => {
    const newButton: PrincipleHopeButtonData = {
      id: crypto.randomUUID(),
      shortText: { uk: '', en: '' },
      fullText: { uk: '', en: '' },
      link: ''
    };
    updateButtonsList([...buttonsList, newButton]);
    return newButton;
  };

  const handleRemoveButton = (idToRemove: string) => {
    updateButtonsList(buttonsList.filter((btn) => btn.id !== idToRemove));
  };

  const handleUpdateSingleButton = (updatedButton: PrincipleHopeButtonData) => {
    updateButtonsList(buttonsList.map((btn) => (btn.id === updatedButton.id ? updatedButton : btn)));
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

        {/* --- МАСИВ КНОПОК ЧЕРЕЗ CONFIGURABLE LIST --- */}
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ mb: 2, fontWeight: 'bold' }}>
            Додаткові кнопки ({buttonsList.length}):
          </Typography>
          
          <ConfigurableList
            items={buttonsList}
            addBtnLabel="Додати кнопку"
            editable
            onCreate={handleAddButton}
            onChange={handleUpdateSingleButton}
            onDelete={handleRemoveButton}
            renderItem={({ item }) => (
              <PrincipleHopeButtonCard
                key={item.id}
                button={item}
                currentLocale={currentLocale}
                onChangeButton={handleUpdateSingleButton}
              />
            )}
          />
        </Box>

      </Box>
    </CollapsibleBlock>
  );
};