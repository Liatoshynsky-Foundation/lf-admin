'use client';

import { Box, Stack, type StackProps, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Button from '../button/Button';
import { styles } from './PhotoBlock.styles';
import { readFileAsDataURL } from '~/lib/utils/readFileAsDataURL';
import ImageIcon from '~/public/icons/image.svg';
import PencilIcon from '~/public/icons/pencil.svg';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalOpenState, MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import { useImageMetadata } from '~/shared/hooks/use-image-metadata/useImageMetadata';

interface ImagePreviewBlockProps extends StackProps {
  imageUrl: string;
  fileName?: string;
  title?: string;
  cropWidth?: number;
  cropHeight?: number;
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
  oval = false,
  onChangeImage,
  direction = 'row',
  buttonSpacing = '16px',
  stackSpacing = '32px',
  typographySpacing = '8px'
}: ImagePreviewBlockProps) => {
  const [previewImage, setPreviewImage] = useState<string>(imageUrl);

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaInitial, setMediaInitial] = useState<MediaModalOpenState | undefined>(undefined);

  const [savedCrop, setSavedCrop] = useState<MediaModalResult['crop']>(null);

  useEffect(() => {
    setPreviewImage(imageUrl);
  }, [imageUrl]);

  const { dimensions, fileName: finalFileName } = useImageMetadata(previewImage, fileName);

  const openEditCrop = () => {
    setMediaInitial({
      step: 'CROP',
      selected: {
        kind: 'used',
        id: 'current-image',
        fileName: finalFileName ?? fileName ?? 'image',
        src: previewImage,
        locale: 'uk'
      },
      crop: savedCrop
    });

    setIsMediaModalOpen(true);
  };

  const openChangeImage = () => {
    setMediaInitial({ tab: 'UPLOAD' });
    setIsMediaModalOpen(true);
  };

  const closeMediaModal = () => {
    setIsMediaModalOpen(false);
    setMediaInitial(undefined);
  };

  const handleApplyMediaModal = async (result: MediaModalResult) => {
    const { selected, crop } = result;

    try {
      if (selected.kind === 'upload') {
        const dataUrl = await readFileAsDataURL(selected.file);
        setPreviewImage(dataUrl);
        onChangeImage(selected.file);
      } else if (selected.kind === 'gallery' || selected.kind === 'used') {
        const response = await fetch(selected.src);
        const blob = await response.blob();
        const file = new File([blob], selected.fileName || 'image.jpg', {
          type: blob.type
        });

        setPreviewImage(selected.src);
        onChangeImage(file);
      }

      setSavedCrop(crop);
      toast.success('Зображення змінено');
    } catch {
      toast.error('Не вдалося змінити');
    } finally {
      closeMediaModal();
    }
  };

  return (
    <Box sx={styles.container}>
      {title ? (
        <Typography variant="subtitle1" sx={styles.sectionTitle}>
          {title}
        </Typography>
      ) : null}

      <Box sx={styles.imageBlock}>
        <Box
          component="img"
          src={previewImage}
          alt="Preview"
          sx={oval ? styles.imageOvalPreview : styles.imagePreview}
        />

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

            {dimensions ? (
              <Typography variant="body2" color="text.secondary" sx={styles.imageSizeText}>
                    Розмір: {dimensions.width} × {dimensions.height}
              </Typography>
            ) : null}
          </Stack>

          <Stack direction={direction} spacing={buttonSpacing} mt={1} width="330px">
            <Button
              startIcon={<PencilIcon style={{ marginRight: '-8px' }} />}
              variant="outlined"
              color="primary"
              size="small"
              onClick={openEditCrop}
              style={styles.editButton}
            >
                Редагувати
            </Button>

            <Button
              startIcon={<ImageIcon style={{ marginRight: '-8px' }} />}
              variant="outlined"
              color="primary"
              size="small"
              onClick={openChangeImage}
              sx={styles.changeButton}
            >
                Змінити зображення
            </Button>
          </Stack>
        </Stack>
      </Box>

      <MediaModal
        open={isMediaModalOpen}
        initial={mediaInitial}
        onClose={closeMediaModal}
        onApply={handleApplyMediaModal}
      />
    </Box>
  );
};
