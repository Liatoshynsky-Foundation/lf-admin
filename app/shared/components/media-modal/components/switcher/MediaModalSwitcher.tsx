'use client';

import { Button, ButtonGroup } from '@mui/material';
import React from 'react';

import type { MediaModalTab } from '../../MediaModal.types';
import FileClockIcon from '~/public/icons/fileClock.svg';
import GalleryIcon from '~/public/icons/gallery.svg';
import UploadIcon from '~/public/icons/upload.svg';

type Props = Readonly<{
  value: MediaModalTab;
  onChange: (v: MediaModalTab) => void;
  galleryLabel?: string;
}>;

export function MediaModalSwitcher({ value, onChange, galleryLabel = 'Галерея' }: Props) {
  const isGallery = value === 'GALLERY';
  const isUpload = value === 'UPLOAD';
  const isUsed = value === 'USED';

  return (
    <ButtonGroup color="secondary" role="tablist" aria-label="media modal switcher" data-testid="MediaModalSwitcher">
      <Button
        variant={isGallery ? 'contained' : 'text'}
        onClick={() => onChange('GALLERY')}
        role="tab"
        aria-selected={isGallery}
        tabIndex={isGallery ? 0 : -1}
        data-testid="MediaModalSwitcher-galleryTab"
      >
        <GalleryIcon aria-hidden focusable={false} />
        {galleryLabel}
      </Button>

      <Button
        variant={isUpload ? 'contained' : 'text'}
        onClick={() => onChange('UPLOAD')}
        role="tab"
        aria-selected={isUpload}
        tabIndex={isUpload ? 0 : -1}
        data-testid="MediaModalSwitcher-uploadTab"
      >
        <UploadIcon aria-hidden focusable={false} />
        Завантаження
      </Button>

      <Button
        variant={isUsed ? 'contained' : 'text'}
        onClick={() => onChange('USED')}
        role="tab"
        aria-selected={isUsed}
        tabIndex={isUsed ? 0 : -1}
        data-testid="MediaModalSwitcher-usedTab"
      >
        <FileClockIcon aria-hidden focusable={false}/>
        Використані
      </Button>
    </ButtonGroup>
  );
}
