'use client';

import { Box } from '@mui/material';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { CropRendererProps } from '../../MediaModal.renderers';
import type { CropResult } from '../../MediaModal.types';
import Button from '~/shared/components/design-system/button/Button';

const canCreateObjectUrl = () => typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
const canRevokeObjectUrl = () => typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function';

const initialCropForPlaceholder = (): CropResult => ({
  rect: { x: 0, y: 0, width: 200, height: 200 }
});

const resizedCropForPlaceholder = (): CropResult => ({
  rect: { x: 24, y: 18, width: 160, height: 220 }
});

export function CropView({ selected, resetSeq, onBaseline, onChange }: Readonly<CropRendererProps>) {
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

  const didInitForSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    if (didInitForSelectedRef.current === selected.id) return;
    didInitForSelectedRef.current = selected.id;

    onBaseline(initialCropForPlaceholder());
  }, [onBaseline, selected.id]);

  return (
    <Box data-testid="CropView" data-reset-seq={resetSeq} sx={{ height: '100%', display: 'grid', gap: 2 }}>
      <Box data-testid="CropView-placeholder" sx={{ opacity: 0.7 }}>
        Crop placeholder
      </Box>

      {previewSrc ? (
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Image
            src={previewSrc}
            alt=""
            width={420}
            height={280}
            sizes="(max-width: 600px) 100vw, 420px"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            unoptimized
          />
        </Box>
      ) : null}

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          color="secondary"
          variant="outlined"
          label="Mock resize"
          data-testid="CropView-resize"
          onClick={() => onChange(resizedCropForPlaceholder())}
        />
      </Box>
    </Box>
  );
}
