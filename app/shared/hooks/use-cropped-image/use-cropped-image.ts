import { useCallback, useMemo, useState } from 'react';

import type { CropResult } from '~/types/common';

export type CroppedImageStyles = {
  container: React.CSSProperties;
  image: React.CSSProperties;
};

function buildCroppedStyles(
  crop: CropResult | null | undefined,
  natW: number,
  natH: number,
  containerW: number,
  containerH: number
): CroppedImageStyles {
  const containerBase: React.CSSProperties = {
    width: containerW,
    height: containerH,
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  };

  if (
    !crop?.rect ||
      crop.rect.width === 0 ||
      crop.rect.height === 0 ||
      natW === 0 ||
      natH === 0
  ) {
    return {
      container: containerBase,
      image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        display: 'block',
      },
    };
  }

  const { x, y, width: cropW, height: cropH } = crop.rect;

  const scaleX = containerW / cropW;
  const scaleY = containerH / cropH;
  const scale = Math.max(scaleX, scaleY);

  const renderedCropW = cropW * scale;
  const renderedCropH = cropH * scale;
  const centerOffsetX = (containerW - renderedCropW) / 2;
  const centerOffsetY = (containerH - renderedCropH) / 2;

  const translateX = -(x * scale) + centerOffsetX;
  const translateY = -(y * scale) + centerOffsetY;

  return {
    container: containerBase,
    image: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: natW,
      height: natH,
      maxWidth: 'none',
      transformOrigin: '0 0',
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      display: 'block',
    },
  };
}

export function useCroppedImage(
  crop: CropResult | null | undefined,
  containerW: number,
  containerH: number
) {
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const onLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  const styles = useMemo(
    () => buildCroppedStyles(crop, naturalSize.w, naturalSize.h, containerW, containerH),
    [crop, naturalSize.w, naturalSize.h, containerW, containerH]
  );

  return { styles, onLoad };
}
