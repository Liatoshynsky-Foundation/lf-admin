import { Box, Button, ButtonGroup, IconButton, Stack } from '@mui/material';
import { ChevronDown, EyeIcon } from 'lucide-react';
import React, { MouseEvent } from 'react';

import { styles } from './HeaderRightActions.style';

interface HeaderRightActionsProps {
  mode?: 'create' | 'edit' | 'seo';
  onEdit?: () => void;
  onPublish?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onMenuOpen?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export default function HeaderRightActions({
  mode = 'create',
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
          <IconButton sx={{ color: 'text.primary' }}>
            <EyeIcon size={24} strokeWidth={1.5} />
          </IconButton>
          <Button onClick={onEdit} variant="contained" disableElevation sx={styles.pill('yellow')}>
              Редагувати
          </Button>
        </>
      );

    case 'edit':
      return (
        <>
          <IconButton sx={{ color: 'text.primary' }}>
            <EyeIcon size={24} strokeWidth={1.5} />
          </IconButton>

          <ButtonGroup variant="contained" disableElevation sx={styles.group}>
            <Button onClick={onPublish} sx={styles.groupLeft}>Опублікувати</Button>
            <Button onClick={onMenuOpen} sx={styles.groupRight}>
              <ChevronDown width={20} />
            </Button>
          </ButtonGroup>
        </>
      );

    case 'seo':
      return (
        <Stack spacing={'12px'} marginLeft={'8px'} direction={'row'}>
          <Button onClick={onCancel} variant="outlined" sx={styles.pill('outline')}>
              Скасувати
          </Button>
          <Button onClick={onSave} variant="contained" disableElevation sx={styles.pill('gray')}>
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
