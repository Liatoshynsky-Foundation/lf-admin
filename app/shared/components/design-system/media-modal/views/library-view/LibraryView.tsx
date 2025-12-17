'use client';

import { Box, Typography } from '@mui/material';
import React from 'react';

type Props = {
  selectedName: string | null;
  onSelect: (name: string) => void;
};

export function LibraryView({ selectedName, onSelect }: Props) {
  const items = ['library-1.png', 'library-2.png', 'library-3.png', 'library-4.png', 'library-5.png', 'library-6.png'];

  return (
    <Box data-testid="LibraryView">
      <Typography variant="body2">Завантаженні файли</Typography>

      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        {items.map((name) => {
          const active = selectedName === name;

          return (
            <Box key={name} component="li">
              <Box
                component="button"
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(name)}
                data-testid={`LibraryView-item-${name}`}
              >
                {active ? '✓ ' : ''}
                {name}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
