'use client';

import { Box } from '@mui/material';
import React from 'react';

import type { MediaModalTab } from '../../MediaModal.types';
import { styles } from './MediaModalSwitcher.styles';
import GalleryIcon from '~/public/icons/gallery.svg';
import UploadIcon from '~/public/icons/upload.svg';
import Button from '~/shared/components/design-system/button/Button';

type Props = {
  value: MediaModalTab;
  onChange: (v: MediaModalTab) => void;
};

export function MediaModalSwitcher({ value, onChange }: Props) {
  const isLibrary = value === 'LIBRARY';
  const isUpload = value === 'UPLOAD';

  return (
    <Box sx={styles.root} role="tablist" aria-label="media modal switcher" data-testid="MediaModalSwitcher">
      <Button
        color="secondary"
        variant={isLibrary ? 'filled' : 'text'}
        disableRipple
        disableFocusRipple
        disableElevation
        onClick={() => onChange('LIBRARY')}
        role="tab"
        aria-selected={isLibrary}
        tabIndex={isLibrary ? 0 : -1}
        data-testid="MediaModalSwitcher-libraryTab"
        sx={styles.tabButton(isLibrary)}
      >
        <GalleryIcon aria-hidden focusable={false} />
        Галерея
      </Button>

      <Button
        color="secondary"
        variant={isUpload ? 'filled' : 'text'}
        disableRipple
        disableFocusRipple
        disableElevation
        onClick={() => onChange('UPLOAD')}
        role="tab"
        aria-selected={isUpload}
        tabIndex={isUpload ? 0 : -1}
        data-testid="MediaModalSwitcher-uploadTab"
        sx={styles.tabButton(isUpload)}
      >
        <UploadIcon aria-hidden focusable={false} />
        Завантажити
      </Button>
    </Box>
  );
}
