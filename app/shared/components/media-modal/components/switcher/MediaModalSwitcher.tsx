'use client';

import { Box } from '@mui/material';
import React from 'react';

import type { MediaModalTab } from '../../MediaModal.types';
import { styles } from './MediaModalSwitcher.styles';
import FileClockIcon from '~/public/icons/fileClock.svg';
import GalleryIcon from '~/public/icons/gallery.svg';
import UploadIcon from '~/public/icons/upload.svg';
import Button from '~/shared/components/design-system/button/Button';

type Props = Readonly<{
  value: MediaModalTab;
  onChange: (v: MediaModalTab) => void;
}>;

export function MediaModalSwitcher({ value, onChange }: Props) {
  const isGallery = value === 'GALLERY';
  const isUpload = value === 'UPLOAD';
  const isUsed = value === 'USED';

  return (
    <Box sx={styles.root} role="tablist" aria-label="media modal switcher" data-testid="MediaModalSwitcher">
      <Button
        color="secondary"
        variant="text"
        disableRipple
        disableFocusRipple
        disableElevation
        onClick={() => onChange('GALLERY')}
        role="tab"
        aria-selected={isGallery}
        tabIndex={isGallery ? 0 : -1}
        data-testid="MediaModalSwitcher-galleryTab"
        sx={styles.tabButton(isGallery)}
      >
        <GalleryIcon aria-hidden focusable={false} />
        Галерея
      </Button>

      <Button
        color="secondary"
        variant="text"
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
        Завантаження
      </Button>

      <Button
        color="secondary"
        variant="text"
        disableRipple
        disableFocusRipple
        disableElevation
        onClick={() => onChange('USED')}
        role="tab"
        aria-selected={isUsed}
        tabIndex={isUsed ? 0 : -1}
        data-testid="MediaModalSwitcher-usedTab"
        sx={styles.tabButton(isUsed)}
      >
        <FileClockIcon aria-hidden focusable={false} />
        Використані
      </Button>
    </Box>
  );
}
