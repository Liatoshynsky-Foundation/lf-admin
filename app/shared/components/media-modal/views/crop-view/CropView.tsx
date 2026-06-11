'use client';

import 'react-image-crop/dist/ReactCrop.css';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactCrop, { PixelCrop } from 'react-image-crop';

import type { CropRendererProps } from '../../MediaModal.renderers';
import { cropViewContainer, styles } from './CropView.styles';

const canCreateObjectUrl = () => typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
const canRevokeObjectUrl = () => typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function';

const INITIAL_CROP_COORDINATES = {
  x: 0,
  y: 0
};

export function CropView({ selected, crop: stateCrop, resetSeq, onBaseline, onChange }: Readonly<CropRendererProps>) {
  const uploadFile = selected.kind === 'upload' ? selected.file : null;
  const [uploadObjectUrl, setUploadObjectUrl] = useState('');
  const [imgError, setImgError] = useState(false);

  const [crop, setCrop] = useState<PixelCrop>();
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  const forCropAngle = imgDimensions ? Math.min(imgDimensions.width, imgDimensions.height) * 0.1 : 40;

  useEffect(() => {
    setImgError(false);
    setImgDimensions(null);
  }, [selected.id]);

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
    if (didInitForSelectedRef.current !== selected.id) {
      setCrop(undefined);
      didInitForSelectedRef.current = selected.id;
    }
  }, [selected.id]);

  const applyCrop = useCallback(
    (rect: { x: number; y: number; width: number; height: number }, img: HTMLImageElement) => {
      const scaleX = img.width / img.naturalWidth;
      const scaleY = img.height / img.naturalHeight;

      setCrop({
        unit: 'px',
        x: rect.x * scaleX,
        y: rect.y * scaleY,
        width: rect.width * scaleX,
        height: rect.height * scaleY
      });

      onBaseline({ rect });
    },
    [onBaseline]
  );

  useEffect(() => {
    if (resetSeq > 0 && imgRef.current) {
      const img = imgRef.current;
      applyCrop({ ...INITIAL_CROP_COORDINATES, width: img.naturalWidth, height: img.naturalHeight }, img);
    }
  }, [resetSeq, applyCrop]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgDimensions({ width: img.width, height: img.height });

    const activeRect = stateCrop?.rect ?? {
      ...INITIAL_CROP_COORDINATES,
      width: img.naturalWidth,
      height: img.naturalHeight
    };

    applyCrop(activeRect, e.currentTarget);
  };

  const handleCropChange = (pixelCrop: PixelCrop) => {
    setCrop(pixelCrop);
  };

  const handleComplete = (c: PixelCrop) => {
    if (!imgRef.current) return;
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    onChange({
      rect: {
        x: c.x * scaleX,
        y: c.y * scaleY,
        width: c.width * scaleX,
        height: c.height * scaleY
      }
    });
  };

  const renderImage = () => {
    if (!previewSrc) return null;

    if (imgError) {
      return (
        <Box sx={styles.errorImgContainer}>
          <Typography variant="textMd">Не вдалося завантажити зображення</Typography>
          <Typography variant="caption" sx={{ wordBreak: 'break-all', opacity: 0.6 }}>
            {previewSrc}
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={styles.imageContainer}>
        <ReactCrop
          crop={crop}
          onChange={handleCropChange}
          onComplete={handleComplete}
          keepSelection
          ruleOfThirds
          style={styles.cropComponent}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={previewSrc}
            alt=""
            onLoad={onImageLoad}
            onError={() => {
              setImgError(true);
            }}
            style={styles.cropComponentImage}
          />
        </ReactCrop>
      </Box>
    );
  };

  return (
    <Box data-testid="CropView" data-reset-seq={resetSeq} sx={cropViewContainer(imgDimensions, forCropAngle)}>
      {renderImage()}
    </Box>
  );
}
