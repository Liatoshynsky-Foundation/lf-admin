import { Box, Button, ButtonGroup, IconButton, Stack } from '@mui/material';
import { ChevronDown, EyeIcon } from 'lucide-react';
import React, { MouseEvent } from 'react';

import { styles } from './HeaderRightActions.style';

export type HeaderRightActionsProps = {
  mode?: 'create' | 'edit' | 'seo';
  disabled?: boolean;
  onEdit?: () => void;
  onPublish?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onMenuOpen?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export default function HeaderRightActions({
  mode = 'create',
  disabled = false,
  onEdit,
  onPublish,
  onSave,
  onCancel,
  onMenuOpen
}: HeaderRightActionsProps) {
  const renderContent = () => {
    switch (mode) {
    case 'create':
      return (
        <>
          <IconButton sx={{ color: 'text.primary' }} aria-label="Передогляд">
            <EyeIcon size={24} strokeWidth={1.5} />
          </IconButton>
          <Button
            disabled={disabled}
            onClick={onEdit}
            variant="contained"
            disableElevation
            sx={styles.pill('yellow')}
          >
              Редагувати
          </Button>
        </>
      );

    case 'edit':
      return (
        <>
          <IconButton sx={{ color: 'text.primary' }} aria-label="Передогляд">
            <EyeIcon size={24} strokeWidth={1.5} />
          </IconButton>

          <ButtonGroup
            variant="contained"
            disableElevation
            sx={styles.group}
            role="group"
            aria-label="Дії публікації"
          >
            <Button disabled={disabled} onClick={onPublish} sx={styles.groupLeft}>
                Опублікувати
            </Button>
            <IconButton aria-label="Відкрити меню параметрів" onClick={onMenuOpen} sx={styles.groupRight}>
              <ChevronDown size={20} />
            </IconButton>
          </ButtonGroup>
        </>
      );

    case 'seo':
      return (
        <Stack spacing={'12px'} marginLeft={'8px'} direction={'row'} role="group" aria-label="Дії збереження">
          <Button onClick={onCancel} variant="outlined" sx={styles.pill('outline')}>
              Скасувати
          </Button>
          <Button disabled={disabled} onClick={onSave} variant="contained" disableElevation sx={styles.pill('yellow')}>
              Зберегти
          </Button>
        </Stack>
      );

    default:
      return null;
    }
  };

  return <Box sx={styles.container}>{renderContent()}</Box>;
}
