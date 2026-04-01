import { Box, Button, ButtonGroup, IconButton, Stack, SxProps, Theme } from '@mui/material';
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
          <IconButton onClick={props.onPreview} sx={{ color: 'text.primary' }} aria-label="Передогляд">
            <EyeIcon size={24} strokeWidth={1.5} />
          </IconButton>
          <Button
            disabled={disabled}
            onClick={props.onEdit}
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
          <IconButton onClick={props.onPreview} sx={{ color: 'text.primary' }} aria-label="Передогляд">
            <EyeIcon size={24} strokeWidth={1.5} />
          </IconButton>

          <ButtonGroup
            variant="contained"
            disableElevation
            sx={styles.group}
            role="group"
            aria-label="Дії публікації"
          >
            <Button disabled={disabled} onClick={props.onPublish} sx={styles.groupLeft}>
                Опублікувати
            </Button>
            <IconButton aria-label="Відкрити меню параметрів" onClick={props.onMenuOpen} sx={styles.groupRight}>
              <ChevronDown size={20} />
            </IconButton>
          </ButtonGroup>
        </>
      );

    case 'seo':
      return (
        <Stack spacing="12px" marginLeft="8px" direction="row" role="group" aria-label="Дії збереження">
          <Button onClick={props.onCancel} variant="outlined" sx={styles.pill('outline')}>
              Скасувати
          </Button>
          <Button
            disabled={disabled}
            onClick={props.onSave}
            variant="contained"
            disableElevation
            sx={styles.pill('yellow')}
          >
              Зберегти
          </Button>
        </Stack>
      );

    default:
      const _exhaustiveCheck: never = mode;
      throw new Error(`Unhandled mode: ${_exhaustiveCheck}`);
    }
  };

  return <Box sx={[styles.container, ...sxToArray(props.sx)]}>{renderContent()}</Box>;
}
