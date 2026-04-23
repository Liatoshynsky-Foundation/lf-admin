'use client';

import { Box, Stack, type StackProps, TextField, Typography } from '@mui/material';
import { CloudUpload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import Button from '../button/Button';
import { PREVIEW_H, PREVIEW_W, styles } from './PhotoBlock.styles';
import { useCroppedImage } from '~/hooks/use-cropped-image/use-cropped-image';
import ImageIcon from '~/public/icons/image.svg';
import PencilIcon from '~/public/icons/pencil.svg';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import type { MediaModalOpenState, MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import { useImageMetadata } from '~/shared/hooks/use-image-metadata/useImageMetadata';

interface ImagePreviewBlockProps extends StackProps {
  imageUrl: string;
  fileName?: string;
  title?: string;
  altText?: string;
  onChangeAltText?: (value: string) => void;
  oval?: boolean;
  onChangeImage: (url: string, crop?: MediaModalResult['crop']) => void;
  initialCrop?: MediaModalResult['crop'];
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  buttonSpacing?: string;
  stackSpacing?: string;
  typographySpacing?: string;
  showAlternativeText?: boolean;
  disabled?: boolean;
}

export const ImagePreviewBlock = ({
  imageUrl,
  fileName,
  title,
  oval = false,
  onChangeImage,
  initialCrop,
  direction = 'row',
  buttonSpacing = '16px',
  stackSpacing = '32px',
  typographySpacing = '8px',
  showAlternativeText = false,
  altText,
  onChangeAltText,
  disabled = false
}: ImagePreviewBlockProps) => {
  const [previewImage, setPreviewImage] = useState<string>(imageUrl);

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaInitial, setMediaInitial] = useState<MediaModalOpenState | undefined>(undefined);
  const [savedCrop, setSavedCrop] = useState<MediaModalResult['crop']>(initialCrop ?? null);

  useEffect(() => {
    setPreviewImage(imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    setSavedCrop(initialCrop ?? null);
  }, [initialCrop]);

  const { dimensions, fileName: finalFileName } = useImageMetadata(previewImage, fileName);
  const displayedFileName =
    finalFileName && finalFileName.length > 15 ? `${finalFileName.slice(0, 15)}...` : finalFileName;

  const { styles: cropStyles, onLoad: onImgLoad } = useCroppedImage(savedCrop, PREVIEW_W, PREVIEW_H);

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

  const handleApplyMediaModal = (result: MediaModalResult) => {
    const { selected, crop, uploadResult } = result;

    const url = uploadResult?.url ?? (selected.kind === 'upload' ? null : selected.src);

    if (!url) {
      toast.error('Не вдалося отримати URL зображення');
      return;
    }

    setPreviewImage(url);
    setSavedCrop(crop);
    onChangeImage(url, crop);

    toast.success('Зображення змінено');
  };

  const renderPreviewContent = useMemo(() => {
    if (!previewImage) {
      return (
        <Box sx={styles.imagePreview}>
          <CloudUpload data-testid="cloud-upload-icon" size={76} strokeWidth={1.5} style={{ opacity: 0.3 }} />
        </Box>
      );
    }

    if (oval) {
      return <Box component="img" src={previewImage} alt={title || 'Selected'} sx={styles.imageOvalPreview} />;
    }

    return (
      <Box sx={cropStyles.container}>
        <Box component="img" src={previewImage} alt={title || 'Selected'} onLoad={onImgLoad} sx={cropStyles.image} />
      </Box>
    );
  }, [previewImage, oval, title, cropStyles, onImgLoad]);

  return (
    <Box sx={styles.container}>
      {title ? (
        <Typography variant="subtitle1" sx={styles.sectionTitle}>
          {title}
        </Typography>
      ) : null}

      <Box sx={styles.imageBlock}>
        {renderPreviewContent}

        <Stack spacing={stackSpacing} sx={styles.rightBlock}>
          <Stack spacing={typographySpacing} sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', gap: '4px', minWidth: 0 }}>
              <Typography variant="body1" sx={{ ...styles.fileNameText, flexShrink: 0 }}>
                Назва файлу
              </Typography>
              <Typography variant="body1" sx={styles.fileNameText}>
                {displayedFileName}
              </Typography>
            </Box>

            {dimensions ? (
              <Typography variant="body2" color="text.secondary" sx={styles.imageSizeText}>
                Розмір: {dimensions.width} × {dimensions.height}
              </Typography>
            ) : null}
          </Stack>

          {showAlternativeText && (
            <TextField
              label="Alt текст зображення"
              value={altText || ''}
              onChange={(e) => onChangeAltText?.(e.target.value)}
              fullWidth
              margin="none"
              multiline
              maxRows={4}
              disabled={!previewImage}
            />
          )}

          <Stack direction={direction} spacing={buttonSpacing}>
            <Button
              startIcon={
                <PencilIcon style={{ marginRight: '-8px', width: '16px', height: '24px', marginTop: '6px' }} />
              }
              variant="outlined"
              color="primary"
              size="small"
              onClick={openEditCrop}
              style={styles.editButton}
              disabled={disabled}
            >
              Редагувати
            </Button>

            <Button
              startIcon={<ImageIcon style={{ marginRight: '-8px', width: '16px', height: '24px', marginTop: '6px' }} />}
              variant="outlined"
              color="primary"
              size="small"
              onClick={openChangeImage}
              sx={styles.changeButton}
              disabled={disabled}
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
        directory="images"
      />
    </Box>
  );
};
