'use client';
import React, { useState } from 'react';
import Cropper from 'react-easy-crop';

interface CropperLFProps {
  width: number;
  height: number;
  imageUrl: string;
}

export const CropperLF: React.FC<CropperLFProps> = ({ width, height, imageUrl }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 200,
        background: '#333'
      }}
    >
      <Cropper
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        aspect={width / height}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        cropShape="rect"
        showGrid={true}
      />
    </div>
  );
};
