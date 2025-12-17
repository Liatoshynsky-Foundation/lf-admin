'use client';

import { Box, Typography } from '@mui/material';
import React, { useRef } from 'react';

import Button from '~/shared/components/design-system/button/Button';

type Props = {
  selectedName: string | null;
  onSelect: (name: string) => void;
};

export function UploadView({ selectedName, onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box data-testid="UploadView">
      <Box data-testid="UploadView-dropzone">
        <Typography variant="body2">Перетягніть файл сюди або оберіть вручну</Typography>

        <Button
          color="secondary"
          variant="filled"
          label="Обрати файл"
          data-testid="UploadView-chooseFileButton"
          onClick={() => inputRef.current?.click()}
        />

        {selectedName ? <Typography variant="body2">Selected: {selectedName}</Typography> : null}
      </Box>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/*"
        data-testid="UploadView-fileInput"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file.name);
        }}
      />
    </Box>
  );
}
