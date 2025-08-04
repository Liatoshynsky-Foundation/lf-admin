'use client';
import 'react-image-crop/dist/ReactCrop.css';
import { Box, Button, Modal, Typography } from '@mui/material';
import { useState } from 'react';
import { PixelCrop } from 'react-image-crop';

import getCroppedImg from '../../../../lib/utils/CropperHelper';
import Alert from '../alert/Alert';
import { styles } from './CropperModal.styles';
import { ImageCropper } from './ImageCropper/ImageCropper';

interface CropperModalProps {
  width: number;
  height: number;
  imageUrl: string;
  open: boolean;
  handleClose: () => void;
  handleSetNewPic: (newImage: string) => void;
  handleSetNewPics?: (newImage: string[]) => void;
}

export const CropperModal: React.FC<CropperModalProps> = ({
  width,
  height,
  imageUrl,
  open,
  handleClose,
  handleSetNewPic,
  handleSetNewPics = () => {}
}) => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [crop, setCrop] = useState<PixelCrop>();
  const imageName = imageUrl.split('./')[1];
  const handleCroppedImage = (imageUrl: PixelCrop) => {
    setCrop(imageUrl);
  };

  const handleSave = async () => {
    try {
      const result = await getCroppedImg(imageUrl, crop as PixelCrop, { width, height }, [
        { width: 300, height: 200 },
        { width: 600, height: 400 }
      ]);
      handleSetNewPic(result.dataUrl);
      handleSetNewPics(result.allImagesUrl);
      handleClose();
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <Modal open={open} onClose={handleClose} sx={styles.modal}>
      <Box sx={styles.modalContent}>
        {errorMessage && (
          <Alert
            title="Something went wrong :("
            severity="error"
            description={errorMessage}
            onClose={() => {
              setErrorMessage('');
            }}
          />
        )}
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
