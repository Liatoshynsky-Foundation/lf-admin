'use client';

import { Box } from '@mui/material';

import type { UsedMedia } from '../../MediaModal.types';
import { MediaPickList } from '../MediaPickList';

type Props = Readonly<{
  selected: UsedMedia | null;
  onPick: (selected: UsedMedia) => void;
}>;

const demoItems: Array<UsedMedia> = [
  { kind: 'used', id: 'used-1-uk', fileName: 'used-1.png', src: '/demo/used-1.png', locale: 'uk' },
  { kind: 'used', id: 'used-1-en', fileName: 'used-1.png', src: '/demo/used-1.png', locale: 'en' }
];

export function UsedView({ selected, onPick }: Props) {
  return (
    <Box data-testid="UsedView" sx={{ height: '100%' }}>
      <MediaPickList items={demoItems} selectedId={selected?.id ?? null} testIdPrefix="UsedView-item" onPick={onPick} />
    </Box>
  );
}
