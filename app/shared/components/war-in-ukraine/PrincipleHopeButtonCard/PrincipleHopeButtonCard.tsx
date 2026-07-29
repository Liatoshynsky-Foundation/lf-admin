'use client';

import { Divider,Stack } from '@mui/material';
import React from 'react';

import { ClickableButtonData } from '../ConfigurableButtonList/ConfigurableButtonList';
import { styles } from './PrincipleHopeButtonCard.styles';
import { CustomTextField } from '~/ds-components/text-field/TextField';

type ButtonItemProps = {
  button: ClickableButtonData;
  currentLocale: 'uk' | 'en';
  onChangeButton: (updatedButton: ClickableButtonData) => void;
};

export const PrincipleHopeButtonCard = ({ button, currentLocale, onChangeButton }: ButtonItemProps) => {
  const handleTextChange = (
    field: 'shortText' | 'fullText',
    e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const textValue = typeof e === 'string' ? e : e?.target?.value || '';

    onChangeButton({
      ...button,
      [field]: {
        uk: button[field]?.uk || '',
        en: button[field]?.en || '',
        [currentLocale]: textValue
      }
    });
  };

  const handleLinkChange = (e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const linkValue = typeof e === 'string' ? e : e?.target?.value || '';
    onChangeButton({ ...button, link: linkValue });
  };

  return (
    <Stack direction="column" gap={2} width="100%" mt={1}>
      <CustomTextField
        title="Короткий текст кнопки"
        label="Наприклад: Фонд «Принцип надії»"
        value={button.shortText?.[currentLocale] || ''}
        onChange={(e) => handleTextChange('shortText', e)}
        fullWidth
      />

      <CustomTextField
        title="Повний текст кнопки"
        label="Наприклад: Благодійний фонд «Принцип надії»"
        value={button.fullText?.[currentLocale] || ''}
        onChange={(e) => handleTextChange('fullText', e)}
        fullWidth
      />

      <CustomTextField
        title="Посилання (URL)"
        label="https://..."
        value={button.link || ''}
        onChange={handleLinkChange}
        fullWidth
      />
      
      <Divider sx={styles.divider} />
    </Stack>
  );
};