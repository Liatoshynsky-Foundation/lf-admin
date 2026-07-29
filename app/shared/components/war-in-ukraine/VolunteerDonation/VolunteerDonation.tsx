'use client';

import { Box, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import {
  VolunteerDonationMethodCard,
  type VolunteerPaymentMethodData
} from '../VolunteerDonationMethodCard/VolunteerDonationMethodCard';
import { styles } from './VolunteerDonation.styles';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { CROP_RATIOS } from '~/constants/publications';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

export const VolunteerDonation = () => {
  const pageId = PAGE_IDS.WAR_IN_UKRAINE;
  const blockId = BLOCK_IDS.VOLUNTEER_DONATION;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale) as 'uk' | 'en';
  const setField = useStore((state) => state.setField);
  const toggleBlockVisibility = useStore((state) => state.toggleBlockVisibility);

  const methodsList = useMemo(() => {
    const rawMethods: Partial<VolunteerPaymentMethodData>[] = block?.paymentMethods || [];
    return rawMethods.map((method, index) => ({
      ...method,
      label: method.label || { uk: '', en: '' },
      value: method.value || '',
      id: method.id || `method-${index}-${crypto.randomUUID()}`
    })) as VolunteerPaymentMethodData[];
  }, [block?.paymentMethods]);

  if (!block) return <EditBlockSkeleton />;

  const handleTextChange = (
    field: 'title' | 'caption',
    e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const textValue = typeof e === 'string' ? e : e?.target?.value || '';
    setField(pageId, blockId, field, {
      uk: block[field]?.uk || '',
      en: block[field]?.en || '',
      [currentLocale]: textValue
    });
  };

  const handleChangeImage = (url: string) => {
    setField(pageId, blockId, 'imageSrc', url);
  };

  const updateMethodsList = (newList: VolunteerPaymentMethodData[]) => {
    setField(pageId, blockId, 'paymentMethods', newList);
  };

  const handleAddMethod = () => {
    const newMethod: VolunteerPaymentMethodData = {
      id: crypto.randomUUID(),
      label: { uk: '', en: '' },
      value: ''
    };
    updateMethodsList([...methodsList, newMethod]);
    return newMethod;
  };

  const handleRemoveMethod = (idToRemove: string | number) => {
    updateMethodsList(methodsList.filter((m) => m.id !== idToRemove));
  };

  const handleUpdateSingleMethod = (updatedMethod: VolunteerPaymentMethodData) => {
    updateMethodsList(methodsList.map((m) => (m.id === updatedMethod.id ? updatedMethod : m)));
  };

  return (
    <CollapsibleBlock
      title="Блок донатів (Реквізити)"
      grip
      hidden={block.hidden}
      onToggleVisibility={() => toggleBlockVisibility(pageId, blockId)}
    >
      <Box sx={styles.fieldsWrapper}>
        <Typography sx={styles.sectionTitle}>Основні тексти</Typography>

        <CustomTextField
          title="Заголовок"
          label="Наприклад: НА АВТІВКИ ДЛЯ ЗСУ:"
          value={block.title?.[currentLocale] || ''}
          onChange={(e) => handleTextChange('title', e)}
          fullWidth
        />

        <CustomTextField
          title="Підпис під фотографією"
          label="Текст"
          value={block.caption?.[currentLocale] || ''}
          onChange={(e) => handleTextChange('caption', e)}
          fullWidth
        />

        <Typography sx={styles.sectionTitle}>Фотографія</Typography>
        <ImagePreviewBlock
          imageUrl={block.imageSrc || '/images/light-logo.svg'}
          fileName="volunteer-donation-image"
          onChangeImage={handleChangeImage}
          direction="column"
          buttonSpacing="8px"
          stackSpacing="24px"
          aspectRatio={CROP_RATIOS.FUNDATION_MAIN_FOUNDER}
        />

        <Box>
          <Typography sx={styles.sectionTitle}>Реквізити оплати ({methodsList.length})</Typography>

          <ConfigurableList
            items={methodsList}
            addBtnLabel="Додати реквізити"
            editable
            onCreate={handleAddMethod}
            onChange={handleUpdateSingleMethod}
            onDelete={handleRemoveMethod}
            renderItem={({ item }) => (
              <VolunteerDonationMethodCard
                key={item.id}
                method={item}
                currentLocale={currentLocale}
                onChangeMethod={handleUpdateSingleMethod}
              />
            )}
          />
        </Box>
      </Box>
    </CollapsibleBlock>
  );
};
