'use client';

import { Box, Stack, StackProps, Typography } from '@mui/material';
import { readFileAsDataURL } from 'app/lib/utils/readFileAsDataURL';
import { useImageMetadata } from 'app/shared/hooks/use-image-metadata/useImageMetadata';
import { useEffect, useRef, useState } from 'react';

import Button from '../button/Button';
import { CropperModal } from '../cropper-modal/CropperModal';
import { styles } from './PhotoBlock.styles';
import ImageIcon from '~/public/icons/image.svg';
import PencilIcon from '~/public/icons/pencil.svg';

interface ImagePreviewBlockProps extends StackProps {
  imageUrl: string;
  fileName?: string;
  title?: string;
  cropWidth: number;
  cropHeight: number;
  oval?: boolean;
  onChangeImage: (file: File) => void;
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  buttonSpacing?: string;
  stackSpacing?: string;
  typographySpacing?: string;
}

export const ImagePreviewBlock = ({
  imageUrl,
  fileName,
  title,
  cropWidth,
  cropHeight,
  oval = false,
  onChangeImage,
  direction = 'row',
  buttonSpacing = '16px',
  stackSpacing = '32px',
  typographySpacing = '8px'
}: ImagePreviewBlockProps) => {
  const [previewImage, setPreviewImage] = useState<string>(imageUrl);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewImage(imageUrl);
  }, [imageUrl]);

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
      {title && (
        <Typography variant="subtitle1" sx={styles.sectionTitle}>
          {title}
        </Typography>
      )}
      <Box sx={styles.imageBlock}>
        <Box component="img" src={previewImage} alt="Preview" sx={styles.imagePreview} />
        <Stack spacing={stackSpacing} maxWidth="200px">
          <Stack spacing={typographySpacing}>
            <Typography
              variant="body1"
              sx={{
                ...styles.fileNameText,
                ...styles.trimmedTypography
              }}
            >
              Назва файлу {finalFileName}
            </Typography>

            {dimensions && (
              <Typography variant="body2" color="text.secondary" sx={styles.imageSizeText}>
                Розмір: {dimensions.width} × {dimensions.height}
              </Typography>
            )}
          </Stack>
          <Stack direction={direction} spacing={buttonSpacing} mt={1} width="330px">
            <Button
              startIcon={<PencilIcon style={{ marginRight: '-8px' }} />}
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => setIsCropperOpen(true)}
              style={styles.editButton}
            >
              Редагувати
            </Button>
            <Button
              startIcon={<ImageIcon style={{ marginRight: '-8px' }} />}
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleClickSelectImage}
              sx={styles.changeButton}
            >
              Змінити зображення
            </Button>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
          </Stack>
        </Stack>
      </Box>

      <CropperModal
        open={isCropperOpen}
        oval={oval}
        imageUrl={imageUrl}
        width={cropWidth}
        height={cropHeight}
        handleClose={() => setIsCropperOpen(false)}
        handleSetNewPic={setPreviewImage}
      />
    </Box>
  );
};
