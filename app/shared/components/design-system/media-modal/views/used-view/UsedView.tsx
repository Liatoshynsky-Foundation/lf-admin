'use client';

import { Box } from '@mui/material';

import type { MediaLocale, SelectedMedia } from '../../MediaModal.types';
import Button from '~/shared/components/design-system/button/Button';

type SelectedUsed = { kind: 'used'; name: string; locale: MediaLocale };

type Props = {
  selected: SelectedUsed | null;
  onPick: (selected: SelectedMedia) => void;
};

const demoItems: Array<{ name: string; locale: MediaLocale }> = [
  { name: 'used-1.png', locale: 'UA' },
  { name: 'used-1.png', locale: 'EN' }
];

export function UsedView({ selected, onPick }: Props) {
  return (
    <Box data-testid="UsedView" sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {demoItems.map((it) => {
          const isActive = Boolean(selected && selected.name === it.name && selected.locale === it.locale);

          return (
            <Button
              key={`${it.name}-${it.locale}`}
              color="secondary"
              variant={isActive ? 'filled' : 'outlined'}
              label={`${it.name} (${it.locale})`}
              data-testid={`UsedView-item-${it.name}-${it.locale}`}
              aria-pressed={isActive}
              onClick={() => onPick({ kind: 'used', name: it.name, locale: it.locale })}
            />
          );
        })}
      </Box>
    </Box>
  );
}
