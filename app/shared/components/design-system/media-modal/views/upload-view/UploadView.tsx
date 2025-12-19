'use client';

import { Box } from '@mui/material';
import { useRef } from 'react';

import type { UploadMedia } from '../../MediaModal.types';
import Button from '~/shared/components/design-system/button/Button';

type Props = {
  selected: UploadMedia | null;
  onPick: (selected: UploadMedia) => void;
};

export function UploadView({ selected: _selected, onPick }: Props) {
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
          const file = e.currentTarget.files?.[0];
          if (!file) return;

          e.currentTarget.value = '';

          const id = `${file.lastModified}-${file.name}`;

          onPick({
            kind: 'upload',
            id,
            fileName: file.name,
            file
          });
        }}
      />
    </Box>
  );
}
