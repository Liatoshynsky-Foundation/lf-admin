'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import { readFileAsDataURL } from 'app/lib/utils/readFileAsDataURL';
import { useImageMetadata } from 'app/shared/hooks/use-image-metadata/useImageMetadata';
import { useRef, useState } from 'react';

import ImageIcon from '../../../../../public/icons/image.svg';
import PencilIcon from '../../../../../public/icons/pencil.svg';
import { CropperModal } from '../cropper-modal/CropperModal';
import { styles } from './PhotoBlock.styles';

type ImagePreviewBlockProps = {
  imageUrl: string;
  fileName?: string;
  cropWidth: number;
  cropHeight: number;
  onChangeImage: (file: File) => void;
};

export const ImagePreviewBlock = ({
  imageUrl,
  fileName,
  cropWidth,
  cropHeight,
  onChangeImage
}: ImagePreviewBlockProps) => {
  const [previewImage, setPreviewImage] = useState<string>(imageUrl);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { dimensions, fileName: finalFileName } = useImageMetadata(previewImage, fileName);

  const handleClickSelectImage = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await readFileAsDataURL(file);
    setPreviewImage(result);
    onChangeImage(file);
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="subtitle1" sx={styles.sectionTitle}>
        Основне зображення
      </Typography>

      <Box sx={styles.imageBlock}>
        <Box component="img" src={previewImage} alt="Preview" sx={styles.imagePreview} />

        <Stack>
          <Typography variant="body1" sx={styles.fileNameText}>
            Назва файлу {finalFileName}
          </Typography>

          {dimensions && (
            <Typography variant="body2" color="text.secondary" sx={styles.imageSizeText}>
              Розмір: {dimensions.width} × {dimensions.height}
            </Typography>
          )}

          <Stack direction="row" spacing="16px" mt={1}>
            <Button sx={styles.roundedButton} onClick={() => setIsCropperOpen(true)}>
              <PencilIcon /> Редагувати
            </Button>
            <Button sx={styles.roundedButton} onClick={handleClickSelectImage}>
              <ImageIcon /> Змінити зображення
            </Button>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
          </Stack>
        </Stack>
      </Box>

      <CropperModal
        open={isCropperOpen}
        imageUrl={previewImage}
        width={cropWidth}
        height={cropHeight}
        handleClose={() => setIsCropperOpen(false)}
        handleSetNewPic={setPreviewImage}
      />
    </Box>
  );
};
