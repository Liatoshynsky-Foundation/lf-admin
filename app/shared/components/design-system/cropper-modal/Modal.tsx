'use client';
import { Modal } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import { CropperLF } from './Cropper';

export const ModalLF = () => {
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const handleCroppedImage = (imageUrl: string) => {
    setCroppedImageUrl(imageUrl);
  };
  return (
    <Modal open={true} sx={{ width: '912px', alignSelf: 'center', justifySelf: 'center', padding: '40px' }}>
      {croppedImageUrl ? (
        <Image src={croppedImageUrl} alt="Cropped result" style={{ maxWidth: '100%' }} width={500} height={500} />
      ) : (
        <CropperLF width={816} height={300} imageUrl="./Image.png" onCropComplete={handleCroppedImage} />
      )}
    </Modal>
  );
};
