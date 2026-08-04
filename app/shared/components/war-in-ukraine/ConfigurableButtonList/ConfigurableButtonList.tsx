'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';

import { PrincipleHopeButtonCard } from '../PrincipleHopeButtonCard/PrincipleHopeButtonCard';
import { styles } from './ConfigurableButtonList.styles';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';

export type ClickableButtonData = {
  id: string;
  shortText: Record<'uk' | 'en', string>;
  fullText: Record<'uk' | 'en', string>;
  link: string;
};

type ConfigurableButtonListProps = {
  buttons: Partial<ClickableButtonData>[];
  currentLocale: 'uk' | 'en';
  title: string;
  addBtnLabel: string;
  onChange: (newButtons: ClickableButtonData[]) => void;
};

export const ConfigurableButtonList = ({
  buttons,
  currentLocale,
  title,
  addBtnLabel,
  onChange
}: ConfigurableButtonListProps) => {
  const buttonsList = buttons.map((btn, index) => ({
    ...btn,
    shortText: btn.shortText || { uk: '', en: '' },
    fullText: btn.fullText || { uk: '', en: '' },
    link: btn.link || '',
    id: btn.id || `btn-${index}`
  })) as ClickableButtonData[];

  const handleAddButton = () => {
    const newButton: ClickableButtonData = {
      id: crypto.randomUUID(),
      shortText: { uk: '', en: '' },
      fullText: { uk: '', en: '' },
      link: ''
    };
    onChange([...buttonsList, newButton]);
    return newButton;
  };

  const handleRemoveButton = (idToRemove: string | number) => {
    onChange(buttonsList.filter((btn) => btn.id !== idToRemove));
  };

  const handleUpdateSingleButton = (updatedButton: ClickableButtonData) => {
    onChange(buttonsList.map((btn) => (btn.id === updatedButton.id ? updatedButton : btn)));
  };

  return (
    <Box sx={styles.container}>
      <Typography sx={styles.title}>
        {title} ({buttonsList.length}):
      </Typography>

      <ConfigurableList
        items={buttonsList}
        addBtnLabel={addBtnLabel}
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
  );
};