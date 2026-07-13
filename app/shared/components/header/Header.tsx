'use client';

import { Box, Stack, Typography } from '@mui/material';

import Button from '../design-system/button/Button';
import LanguageSwitcher from '../language-switcher/LanguageSwitcher';
import { styles } from './Header.styles';
import ExternalLink from '~/public/icons/externalLink.svg';

type HeaderProps = {
  title: string;
  onPreview: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  onLanguageChange: (lang: 'uk' | 'en') => void;
  isActionsDisabled?: boolean;
};

export const Header = ({ title, onPreview, onSave, onCancel, isSaving, onLanguageChange, isActionsDisabled }: HeaderProps) => {
  return (
    <Box sx={styles.container}>
      <Box>
        <Typography variant="h4" mb={0.5}>
          {title}
        </Typography>
        <Typography variant="textMd" color="text.secondary">
          Редагуйте та змінюйте вміст сторінки “{title}”.
        </Typography>
      </Box>

      <Stack
        width="100%"
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <LanguageSwitcher languageSwitcher={onLanguageChange} />
          <Button variant="outlined" color="primary" onClick={onPreview} startIcon={<ExternalLink />}>
            Попередній перегляд
          </Button>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="primary" sx={styles.actionButton} onClick={onCancel} disabled={isActionsDisabled}>
            Скасувати зміни
          </Button>
          <Button variant="filled" color="primary" sx={styles.actionButton} onClick={onSave} disabled={isSaving || isActionsDisabled}>
            Зберегти
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
