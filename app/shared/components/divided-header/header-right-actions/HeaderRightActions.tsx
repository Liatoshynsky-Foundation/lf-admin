import { Box, Button, IconButton, Stack, SxProps, Theme } from '@mui/material';
import { ChevronDown, EyeIcon } from 'lucide-react';
import React, { MouseEvent } from 'react';

import { styles } from './HeaderRightActions.style';
import { sxToArray } from '~/lib/utils/sxToArray';

type BaseProps = {
  disabled?: boolean;
  sx?: SxProps<Theme>;
};

type CreateModeProps = BaseProps & {
  mode: 'create';
  onEdit?: () => void;
  onPreview?: () => void;
};

type EditModeProps = BaseProps & {
  mode: 'edit';
  onPublish?: () => void;
  onMenuOpen?: (event: MouseEvent<HTMLButtonElement>) => void;
  onPreview?: () => void;
};

type SeoModeProps = BaseProps & {
  mode: 'seo';
  onSave?: () => void;
  onCancel?: () => void;
};

export type HeaderRightActionsProps = CreateModeProps | EditModeProps | SeoModeProps;

export default function HeaderRightActions(props: HeaderRightActionsProps) {
  const { disabled = false, mode } = props;

  const renderContent = () => {
    switch (mode) {
    case 'create':
      return (
        <>
          <IconButton onClick={props.onPreview} sx={styles.createContentIcon} aria-label="Передогляд">
            <EyeIcon size={24} strokeWidth={1.5} />
          </IconButton>
          <Button disabled={disabled} onClick={props.onEdit} variant="contained" color="tertiary" disableElevation>
              Редагувати
          </Button>
        </>
      );

    case 'edit':
      return (
        <>
          <IconButton onClick={props.onPreview} sx={styles.icon} aria-label="Передогляд">
            <EyeIcon size={24} strokeWidth={1.5} />
          </IconButton>

          <Box sx={styles.group} role="group" aria-label="Дії публікації">
            <Button
              disabled={disabled}
              onClick={props.onPublish}
              variant="contained"
              color="tertiary"
              disableElevation
              sx={styles.groupLeft}
            >
                Опублікувати
            </Button>
            <Button
              disabled={disabled}
              aria-label="Відкрити меню параметрів"
              onClick={props.onMenuOpen}
              variant="contained"
              color="tertiary"
              disableElevation
              sx={styles.groupRight}
            >
              <ChevronDown size={20} />
            </Button>
          </Box>
        </>
      );

    case 'seo':
      return (
        <Stack spacing="12px" marginLeft="8px" direction="row" role="group" aria-label="Дії збереження">
          <Button onClick={props.onCancel} variant="outlined" color="primary">
              Скасувати
          </Button>
          <Button disabled={disabled} onClick={props.onSave} variant="contained" color="tertiary" disableElevation>
              Зберегти
          </Button>
        </Stack>
      );

    default: {
      const _exhaustiveCheck: never = mode;
      throw new Error(`Unhandled mode: ${_exhaustiveCheck}`);
    }
    }
  };

  return <Box sx={[styles.container, ...sxToArray(props.sx)]}>{renderContent()}</Box>;
}
