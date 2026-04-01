'use client';

import 'react-image-crop/dist/ReactCrop.css';
import { Box } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactCrop, { PixelCrop } from 'react-image-crop';

import type { CropRendererProps } from '../../MediaModal.renderers';

const canCreateObjectUrl = () => typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
const canRevokeObjectUrl = () => typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function';

const MOCK_SERVER_DATA = {
  width: 200,
  height: 250,
  x: 50,
  y: 50
};

const forCropAngle = Math.min(MOCK_SERVER_DATA.width, MOCK_SERVER_DATA.height) * 0.2;

export function CropView({ selected, crop: stateCrop, resetSeq, onBaseline, onChange }: Readonly<CropRendererProps>) {
  const uploadFile = selected.kind === 'upload' ? selected.file : null;
  const [uploadObjectUrl, setUploadObjectUrl] = useState('');

  const [crop, setCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

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

  useEffect(() => {
    if (resetSeq > 0 && imgRef.current) {
      const { width, height, naturalWidth, naturalHeight } = imgRef.current;
      const scaleX = width / naturalWidth;
      const scaleY = height / naturalHeight;

      const resetPixelCrop: PixelCrop = {
        unit: 'px',
        x: MOCK_SERVER_DATA.x * scaleX,
        y: MOCK_SERVER_DATA.y * scaleY,
        width: MOCK_SERVER_DATA.width * scaleX,
        height: MOCK_SERVER_DATA.height * scaleY
      };

      setCrop(resetPixelCrop);

      onBaseline({
        rect: {
          x: MOCK_SERVER_DATA.x,
          y: MOCK_SERVER_DATA.y,
          width: MOCK_SERVER_DATA.width,
          height: MOCK_SERVER_DATA.height
        }
      });
    }
  }, [resetSeq, onBaseline]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
    const scaleX = width / naturalWidth;
    const scaleY = height / naturalHeight;

    const sourceRect = stateCrop?.rect ?? MOCK_SERVER_DATA;

    const initialPixelCrop: PixelCrop = {
      unit: 'px',
      x: sourceRect.x * scaleX,
      y: sourceRect.y * scaleY,
      width: sourceRect.width * scaleX,
      height: sourceRect.height * scaleY
    };

    setCrop(initialPixelCrop);

    onBaseline({
      rect: sourceRect
    });
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

  return (
    <Box
      data-testid="CropView"
      data-reset-seq={resetSeq}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden',

        '& .ReactCrop__crop-selection': {
          animation: 'none !important',
          backgroundImage: 'none !important',

          border: '1px solid #fff',

          background: `
            linear-gradient(#fff, #fff), linear-gradient(#fff, #fff),
            linear-gradient(#fff, #fff), linear-gradient(#fff, #fff),
            linear-gradient(#fff, #fff), linear-gradient(#fff, #fff),
            linear-gradient(#fff, #fff), linear-gradient(#fff, #fff)
           !important`,

          backgroundPosition: `
            top left, top left,        
            top right, top right,      
            bottom left, bottom left,   
            bottom right, bottom right 
          !important`,

          backgroundRepeat: 'no-repeat !important',

          backgroundSize: `
            ${forCropAngle}px 4px, 4px ${forCropAngle}px,  
            ${forCropAngle}px 4px, 4px ${forCropAngle}px,  
            ${forCropAngle}px 4px, 4px ${forCropAngle}px,  
            ${forCropAngle}px 4px, 4px ${forCropAngle}px    
          !important`,
          '&::after': { display: 'none !important', content: 'none' },
          '&::before': { display: 'none !important', content: 'none' }
        },

        '& .ReactCrop__rule-of-thirds-vt': {
          width: '1px !important',
          height: '100% !important'
        },
        '& .ReactCrop__rule-of-thirds-hz': {
          height: '1px !important',
          width: '100% !important'
        }
      }}
    >
      {previewSrc ? (
        <Box
          sx={{
            width: '100%',
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <ReactCrop
            crop={crop}
            onChange={handleCropChange}
            onComplete={handleComplete}
            keepSelection
            ruleOfThirds
            style={{
              maxWidth: '100%',
              display: 'block'
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={previewSrc}
              alt=""
              onLoad={onImageLoad}
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </ReactCrop>
        </Box>
      ) : null}
    </Box>
  );
}
