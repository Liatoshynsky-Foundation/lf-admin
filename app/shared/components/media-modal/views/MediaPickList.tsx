'use client';

import { Box } from '@mui/material';
import React from 'react';

import Button from '~/shared/components/design-system/button/Button';

type ItemBase = {
  id: string;
  fileName: string;
  locale?: string;
};

type Props<T extends ItemBase> = Readonly<{
  items: ReadonlyArray<T>;
  selectedId: string | null;
  testIdPrefix: string;
  onPick: (item: T) => void;
}>;

export function MediaPickList<T extends ItemBase>({ items, selectedId, testIdPrefix, onPick }: Props<T>) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {items.map((it) => {
        const isActive = selectedId === it.id;
        const localeSuffix = it.locale ? ` (${it.locale})` : '';

        return (
          <Button
            key={it.id}
            color="secondary"
            variant={isActive ? 'filled' : 'outlined'}
            label={`${it.fileName}${localeSuffix}`}
            data-testid={`${testIdPrefix}-${it.id}`}
            aria-pressed={isActive}
            onClick={() => onPick(it)}
          />
        );
      })}
    </Box>
  );
}
