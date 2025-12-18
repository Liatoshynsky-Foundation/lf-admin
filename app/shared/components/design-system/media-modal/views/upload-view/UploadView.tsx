'use client';

import { Box } from '@mui/material';
import { useRef } from 'react';

import type { SelectedMedia } from '../../MediaModal.types';
import Button from '~/shared/components/design-system/button/Button';

type Props = {
  onPick: (selected: SelectedMedia) => void;
};

export function UploadView({ onPick }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box data-testid="UploadView" sx={{ height: '100%' }}>
      <Button
        color="secondary"
        variant="filled"
        label="Обрати файл"
        data-testid="UploadView-chooseFileButton"
        onClick={() => inputRef.current?.click()}
      />

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/*"
        data-testid="UploadView-fileInput"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          e.currentTarget.value = '';

          onPick({ kind: 'upload', name: file.name });
        }}
      />
    </Box>
  );
}
