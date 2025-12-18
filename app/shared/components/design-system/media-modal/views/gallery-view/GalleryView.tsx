'use client';

import { Box } from '@mui/material';

import type { MediaLocale, SelectedMedia } from '../../MediaModal.types';
import Button from '~/shared/components/design-system/button/Button';

type SelectedGallery = { kind: 'gallery'; name: string; locale: MediaLocale };

type Props = {
  selected: SelectedGallery | null;
  onPick: (selected: SelectedMedia) => void;
};

const demoItems: Array<{ name: string; locale: MediaLocale }> = [
  { name: 'gallery-1.png', locale: 'UA' },
  { name: 'gallery-1.png', locale: 'EN' },
  { name: 'gallery-2.png', locale: 'UA' }
];

export function GalleryView({ selected, onPick }: Props) {
  return (
    <Box data-testid="GalleryView" sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {demoItems.map((it) => {
          const isActive = Boolean(selected && selected.name === it.name && selected.locale === it.locale);

          return (
            <Button
              key={`${it.name}-${it.locale}`}
              color="secondary"
              variant={isActive ? 'filled' : 'outlined'}
              label={`${it.name} (${it.locale})`}
              data-testid={`GalleryView-item-${it.name}-${it.locale}`}
              aria-pressed={isActive}
              onClick={() => onPick({ kind: 'gallery', name: it.name, locale: it.locale })}
            />
          );
        })}
      </Box>
    </Box>
  );
}
