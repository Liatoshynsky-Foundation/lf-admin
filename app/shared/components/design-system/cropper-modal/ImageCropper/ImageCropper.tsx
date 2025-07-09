import 'react-image-crop/dist/ReactCrop.css';
import { Box } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';
import ReactCrop, { centerCrop, Crop, makeAspectCrop, PixelCrop } from 'react-image-crop';

import { styles } from './ImageCropper.styles';

interface ImageCropperProps {
  width: number;
  height: number;
  imageUrl: string;
  onCropComplete: (croppedImageUrl: PixelCrop) => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ width, height, imageUrl, onCropComplete }) => {
  const [crop, setCrop] = useState<Crop>({
    unit: 'px',
    x: 0,
    y: 0,
    width: width,
    height: height
  });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const aspectRatio = width / height;

  const onImageLoad = useCallback((img: HTMLImageElement) => {
    imgRef.current = img;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: 'px',
          width: width
        },
        aspectRatio,
        img.width,
        img.height
      ),
      img.width,
      img.height
    );
    setCrop(crop);
  }, []);

  return (
    <Box sx={styles.cropper}>
      <ReactCrop crop={crop} onChange={setCrop} onComplete={onCropComplete} aspect={aspectRatio} ruleOfThirds locked>
        <img src={imageUrl} alt="Source" onLoad={(e) => onImageLoad(e.currentTarget)} />
      </ReactCrop>
    </Box>
  );
};
