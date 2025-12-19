'use client';

import { Box } from '@mui/material';

import type { UsedMedia } from '../../MediaModal.types';
import Button from '~/shared/components/design-system/button/Button';

type Props = {
  selected: UsedMedia | null;
  onPick: (selected: UsedMedia) => void;
};

const demoItems: Array<UsedMedia> = [
  { kind: 'used', id: 'used-1-uk', fileName: 'used-1.png', src: '/demo/used-1.png', locale: 'uk' },
  { kind: 'used', id: 'used-1-en', fileName: 'used-1.png', src: '/demo/used-1.png', locale: 'en' }
];

export function UsedView({ selected, onPick }: Props) {
  return (
    <Box data-testid="UsedView" sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {demoItems.map((it) => {
          const isActive = Boolean(selected && selected.id === it.id);

          return (
            <Button
              key={it.id}
              color="secondary"
              variant={isActive ? 'filled' : 'outlined'}
              label={`${it.fileName} (${it.locale})`}
              data-testid={`UsedView-item-${it.id}`}
              aria-pressed={isActive}
              onClick={() => onPick(it)}
            />
          );
        })}
      </Box>
    </Box>
  );
}
