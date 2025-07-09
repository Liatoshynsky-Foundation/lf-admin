'use client';
import 'react-image-crop/dist/ReactCrop.css';
import { Box, Button, Modal, Typography } from '@mui/material';
import { useState } from 'react';
import { PixelCrop } from 'react-image-crop';

import getCroppedImg from '../../../../lib/utils/CropperHelper';
import { styles } from './CropperModal.styles';
import { ImageCropper } from './ImageCropper/ImageCropper';

interface CropperModalPrpos {
  width: number;
  height: number;
  imageUrl: string;
  open: boolean;
  handleClose: () => void;
  handleSetNewPic: (newImage: string) => void;
}

export const CropperModal: React.FC<CropperModalPrpos> = ({
  width,
  height,
  imageUrl,
  open,
  handleClose,
  handleSetNewPic
}) => {
  const [crop, setCrop] = useState<PixelCrop>();
  const imageName = imageUrl.split('./')[1];
  const handleCroppedImage = (imageUrl: PixelCrop) => {
    setCrop(imageUrl);
  };

  const handleSave = async () => {
    const result = await getCroppedImg(imageUrl, crop as PixelCrop, { width, height });
    handleSetNewPic(result.dataUrl);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} sx={styles.modal}>
      <Box sx={styles.modalContent}>
        <Box sx={styles.topSection}>
          <Box sx={styles.textSection}>
            <Typography sx={styles.mainTitle}>Редагування зображення</Typography>
            <Typography sx={styles.subTitle}>{imageName}</Typography>
          </Box>
          <Box sx={styles.buttonSection}>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                color: 'white',
                ...styles.buttons
              }}
            >
              Скасувати
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                color: '#232529',
                backgroundColor: 'white',
                ...styles.buttons
              }}
            >
              Зберегти
            </Button>
          </Box>
        </Box>
        <ImageCropper width={width} height={height} onCropComplete={handleCroppedImage} imageUrl={imageUrl} />
      </Box>
    </Modal>
  );
};
