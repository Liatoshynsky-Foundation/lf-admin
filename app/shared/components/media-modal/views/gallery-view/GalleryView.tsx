'use client';

import { Box } from '@mui/material';

import type { GalleryMedia } from '../../MediaModal.types';
import { MediaPickList } from '../MediaPickList';

type Props = Readonly<{
  selected: GalleryMedia | null;
  onPick: (selected: GalleryMedia) => void;
}>;

const demoItems: Array<GalleryMedia> = [
  { kind: 'gallery', id: 'gallery-1-uk', fileName: 'gallery-1.png', src: '/demo/gallery-1.png', locale: 'uk' },
  { kind: 'gallery', id: 'gallery-1-en', fileName: 'gallery-1.png', src: '/demo/gallery-1.png', locale: 'en' },
  { kind: 'gallery', id: 'gallery-2-uk', fileName: 'gallery-2.png', src: '/demo/gallery-2.png', locale: 'uk' }
];

export function GalleryView({ selected, onPick }: Props) {
  return (
    <Box data-testid="GalleryView" sx={{ height: '100%' }}>
      <MediaPickList
        items={demoItems}
        selectedId={selected?.id ?? null}
        testIdPrefix="GalleryView-item"
        onPick={onPick}
      />
    </Box>
  );
}
