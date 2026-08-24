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
  editLabel?: string;
};

type EditModeProps = BaseProps & {
  mode: 'edit';
  onPublish?: () => void;
  onMenuOpen?: (event: MouseEvent<HTMLButtonElement>) => void;
  onPreview?: () => void;
  showPublish?: boolean;
};

type SeoModeProps = BaseProps & {
  mode: 'seo';
  onPublish?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  onMenuOpen?: (event: MouseEvent<HTMLButtonElement>) => void;
  isPageSeo?: boolean;
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
            {props.editLabel ?? 'Редагувати'}
          </Button>
        </>
      );

    case 'edit': {
      const showPublish = props.showPublish ?? true;

      return (
        <>
          <IconButton onClick={props.onPreview} sx={styles.icon} aria-label="Передогляд">
            <EyeIcon size={24} strokeWidth={1.5} />
          </IconButton>

          <Box sx={styles.group} role="group" aria-label="Дії публікації">
            {showPublish && (
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
            )}
            <Button
              disabled={disabled}
              aria-label="Відкрити меню параметрів"
              onClick={props.onMenuOpen}
              variant="contained"
              color="tertiary"
              disableElevation
              sx={showPublish ? styles.groupRight : styles.groupSingle}
            >
              <ChevronDown size={20} />
            </Button>
          </Box>
        </>
      );
    }

    case 'seo':
      return (
        <Stack spacing="12px" marginLeft="8px" direction="row" role="group" aria-label="Дії збереження">
          <Box sx={styles.group} role="group" aria-label="Дії публікації">
            {props.onCancel && (
              <Button
                disabled={disabled}
                onClick={props.onCancel}
                variant="outlined"
                color="primary"
                disableElevation
                sx={{ mr: '12px' }}
              >
                  Скасувати
              </Button>
            )}

            <Button
              disabled={disabled}
              onClick={props.onPublish}
              variant="contained"
              color="tertiary"
              disableElevation
              sx={props.isPageSeo ? {} : styles.groupLeft}
            >
              {props.isPageSeo ? 'Зберегти' : 'Опублікувати'}
            </Button>

            {props.onMenuOpen && (
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
            )}
          </Box>
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
