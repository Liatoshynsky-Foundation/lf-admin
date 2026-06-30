import 'react-image-crop/dist/ReactCrop.css';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactCrop, { PixelCrop } from 'react-image-crop';

import type { CropRendererProps } from '../../MediaModal.renderers';
import { cropViewContainer, styles } from './CropView.styles';

const canCreateObjectUrl = () => typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
const canRevokeObjectUrl = () => typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function';

const MIN_NATURAL_HEIGHT = 800;

interface Size {
  width: number;
  height: number;
}

interface Rect extends Size {
  x: number;
  y: number;
}

function calculateInitialRect(naturalWidth: number, naturalHeight: number, aspectRatio?: number): Rect {
  let rectWidth = naturalWidth;
  let rectHeight = naturalHeight;
  let x = 0;
  let y = 0;

  if (aspectRatio) {
    const imgAspect = naturalWidth / naturalHeight;

    if (imgAspect > aspectRatio) {
      rectHeight = naturalHeight;
      rectWidth = rectHeight * aspectRatio;
      x = (naturalWidth - rectWidth) / 2;
    } else {
      rectWidth = naturalWidth;
      rectHeight = rectWidth / aspectRatio;
      y = (naturalHeight - rectHeight) / 2;
    }
  }

  return { x, y, width: rectWidth, height: rectHeight };
}

function calculateContainSize(imgNatural: Size, container: Size): Size {
  if (imgNatural.width <= container.width && imgNatural.height <= container.height) {
    return { width: imgNatural.width, height: imgNatural.height };
  }

  const imgRatio = imgNatural.width / imgNatural.height;
  const containerRatio = container.width / container.height;

  return imgRatio > containerRatio
    ? { width: container.width, height: container.width / imgRatio }
    : { width: container.height * imgRatio, height: container.height };
}

function calculateMinDomDimensions(
  img: HTMLImageElement,
  displayHeight: number,
  aspectRatio?: number
): { width?: number; height: number } {
  const maxPossibleNaturalHeight = aspectRatio
    ? Math.min(img.naturalHeight, img.naturalWidth / aspectRatio)
    : img.naturalHeight;

  const actualMinNaturalHeight = Math.min(MIN_NATURAL_HEIGHT, maxPossibleNaturalHeight);
  const scaleY = displayHeight / img.naturalHeight;
  const domMinHeight = actualMinNaturalHeight * scaleY;
  const domMinWidth = aspectRatio ? domMinHeight * aspectRatio : undefined;

  return { width: domMinWidth, height: domMinHeight };
}

export function CropView({
  selected,
  crop: stateCrop,
  resetSeq,
  onBaseline,
  onChange,
  aspectRatio
}: Readonly<CropRendererProps>) {
  const uploadFile = selected.kind === 'upload' ? selected.file : null;
  const [uploadObjectUrl, setUploadObjectUrl] = useState('');
  const [imgError, setImgError] = useState(false);

  const [crop, setCrop] = useState<PixelCrop>();
  const [imgDimensions, setImgDimensions] = useState<Size | null>(null);
  const [minDOMDimensions, setMinDOMDimensions] = useState<{ width?: number; height?: number }>({});

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const latestRef = useRef({ crop, stateCrop, imgDimensions });
  latestRef.current = { crop, stateCrop, imgDimensions };

  const forCropAngle = imgDimensions ? Math.min(imgDimensions.width, imgDimensions.height) * 0.1 : 40;

  useEffect(() => {
    setImgError(false);
    setImgDimensions(null);
    latestRef.current.imgDimensions = null;
    setCrop(undefined);
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

  const applyCrop = useCallback(
    (rect: Rect, img: HTMLImageElement, overrideSize?: Size) => {
      const displayWidth = overrideSize?.width ?? img.width;
      const displayHeight = overrideSize?.height ?? img.height;

      const scaleX = displayWidth / img.naturalWidth;
      const scaleY = displayHeight / img.naturalHeight;

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
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      const img = imgRef.current;
      if (!img || img.naturalWidth === 0 || img.naturalHeight === 0) return;

      const { crop: currentCrop, stateCrop: latestStateCrop, imgDimensions: oldDimensions } = latestRef.current;

      const newDimensions = calculateContainSize(
        { width: img.naturalWidth, height: img.naturalHeight },
        { width: container.clientWidth, height: container.clientHeight }
      );

      setImgDimensions(newDimensions);
      latestRef.current.imgDimensions = newDimensions;

      const { width: domMinWidth, height: domMinHeight } = calculateMinDomDimensions(
        img,
        newDimensions.height,
        aspectRatio
      );
      setMinDOMDimensions({ width: domMinWidth, height: domMinHeight });

      if (currentCrop && oldDimensions && oldDimensions.width > 0 && oldDimensions.height > 0) {
        const resizeScaleX = newDimensions.width / oldDimensions.width;
        const resizeScaleY = newDimensions.height / oldDimensions.height;

        setCrop({
          unit: 'px',
          x: currentCrop.x * resizeScaleX,
          y: currentCrop.y * resizeScaleY,
          width: currentCrop.width * resizeScaleX,
          height: currentCrop.height * resizeScaleY
        });
      } else {
        const activeRect =
          latestStateCrop?.rect ?? calculateInitialRect(img.naturalWidth, img.naturalHeight, aspectRatio);
        applyCrop(activeRect, img, newDimensions);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [applyCrop, aspectRatio]);

  useEffect(() => {
    if (resetSeq > 0 && imgRef.current) {
      const img = imgRef.current;
      const initialRect = calculateInitialRect(img.naturalWidth, img.naturalHeight, aspectRatio);
      applyCrop(initialRect, img);
    }
  }, [resetSeq, applyCrop, aspectRatio]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const dimensions = { width: img.width, height: img.height };
    setImgDimensions(dimensions);
    latestRef.current.imgDimensions = dimensions;

    const { width: domMinWidth, height: domMinHeight } = calculateMinDomDimensions(img, img.height, aspectRatio);
    setMinDOMDimensions({ width: domMinWidth, height: domMinHeight });

    if (stateCrop?.rect) {
      applyCrop(stateCrop.rect, img);
      return;
    }

    const initialRect = calculateInitialRect(img.naturalWidth, img.naturalHeight, aspectRatio);
    applyCrop(initialRect, img);
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
      <Box ref={containerRef} sx={styles.imageContainer}>
        <ReactCrop
          crop={crop}
          onChange={handleCropChange}
          onComplete={handleComplete}
          keepSelection
          ruleOfThirds
          aspect={aspectRatio}
          minHeight={minDOMDimensions.height}
          minWidth={minDOMDimensions.width}
          style={styles.cropComponent}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={previewSrc}
            alt=""
            onLoad={onImageLoad}
            onError={() => setImgError(true)}
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
