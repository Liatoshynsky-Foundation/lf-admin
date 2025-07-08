'use client';
import { Box, Button } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';

import getCroppedImg from './CropperHelper';
interface CropperLFProps {
  width: number;
  height: number;
  imageUrl: string;
  // onCancel: ()=>void;
  onCropComplete: (croppedImageUrl: string) => void;
}

export const CropperLF: React.FC<CropperLFProps> = ({ width = 100, height = 100, imageUrl, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const handleCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
    console.log(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels, {
      width: width,
      height: height
    });
    onCropComplete(croppedImage);
  };

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [imageUrl]);
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'auto',
        background: '#333'
      }}
    >
      <div
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          position: 'relative',
          zIndex: '100'
        }}
      >
        <Button onClick={handleSave}>Save</Button>
      </div>
      <Box
        sx={{
          height: imageSize.height,
          marginTop: '60px',
          top: 0,
          left: 0,
          '.reactEasyCrop_Image': {
            transform: 'none !important'
          },

          '.reactEasyCrop_CropArea': {
            transform: `translate(${-crop.x}px, ${-crop.y}px)`,
            position: 'relative',
            top: 0,
            left: 0
          }
        }}
      >
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={width / height}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          cropShape="rect"
          showGrid={true}
        />
      </Box>
    </div>
  );
};
