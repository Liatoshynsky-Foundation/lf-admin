'use client';

import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import type { CropRendererProps } from '../../MediaModal.renderers';
import Button from '~/shared/components/design-system/button/Button';

const mockCrop = () => ({
  rect: { x: 10, y: 10, width: 200, height: 200 }
});

const canCreateObjectUrl = () => typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
const canRevokeObjectUrl = () => typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function';

export function CropView({ selected, resetSeq, onBaseline, onChange }: CropRendererProps) {
  const uploadFile = selected.kind === 'upload' ? selected.file : null;
  const [uploadObjectUrl, setUploadObjectUrl] = useState('');

  useEffect(() => {
    if (!uploadFile) {
      setUploadObjectUrl('');
      return;
    }

    if (!canCreateObjectUrl()) {
      setUploadObjectUrl('');
      return;
    }

    const url = URL.createObjectURL(uploadFile);
    setUploadObjectUrl(url);

    return () => {
      if (!url) return;
      if (!canRevokeObjectUrl()) return;
      URL.revokeObjectURL(url);
    };
  }, [uploadFile]);

  const previewSrc = useMemo(() => {
    if (selected.kind === 'upload') return uploadObjectUrl;
    return selected.src;
  }, [selected, uploadObjectUrl]);

  return (
    <Box data-testid="CropView" data-reset-seq={resetSeq} sx={{ height: '100%', display: 'grid', gap: 2 }}>
      <Box data-testid="CropView-placeholder" sx={{ opacity: 0.7 }}>
        Crop placeholder
      </Box>

      {previewSrc ? (
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <img src={previewSrc} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </Box>
      ) : null}

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          color="secondary"
          variant="outlined"
          label="Set baseline"
          data-testid="CropView-setBaseline"
          onClick={() => onBaseline(mockCrop())}
        />
        <Button
          color="secondary"
          variant="outlined"
          label="Mock crop"
          data-testid="CropView-setCrop"
          onClick={() => onChange(mockCrop())}
        />
        <Button
          color="secondary"
          variant="outlined"
          label="Clear crop"
          data-testid="CropView-clearCrop"
          onClick={() => onChange(null)}
        />
      </Box>
    </Box>
  );
}
