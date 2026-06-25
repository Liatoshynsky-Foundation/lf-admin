import { Box, Divider, IconButton, Typography } from '@mui/material';
import { useState } from 'react';

import { styles } from './GroupPhotosSection.styles';
import PlusIcon from '~/public/icons/plus.svg';
import TrashIcon from '~/public/icons/trash.svg';
import DeleteCardModal from '~/shared/components/delete-card-modal/DeleteCardModal';
import Button from '~/shared/components/design-system/button/Button';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

export type PhotoItem = {
  id: string;
  src: string;
  fileName: string;
  caption: string;
  altText: string;
  crop?: MediaModalResult['crop'] | null;
};

type GroupPhotosSectionProps = {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
};

export const GroupPhotosSection = ({ photos, onChange }: GroupPhotosSectionProps) => {
  const handleAddPhoto = () => {
    const newPhoto: PhotoItem = {
      id: crypto.randomUUID(),
      src: '',
      fileName: '',
      caption: '',
      altText: '',
      crop: null
    };
    onChange([...photos, newPhoto]);
  };

  const handleUpdatePhoto = (idToUpdate: string, updates: Partial<PhotoItem>) => {
    onChange(photos.map((photo) => (photo.id === idToUpdate ? { ...photo, ...updates } : photo)));
  };

  const [photoIdToDelete, setPhotoIdToDelete] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (photoIdToDelete) {
      onChange(photos.filter((photo) => photo.id !== photoIdToDelete));
      setPhotoIdToDelete(null);
    }
  };

  return (
    <CollapsibleBlock title="Фото" defaultExpanded>
      <Box sx={styles.mainContainer}>
        <Box sx={styles.photosList}>
          {photos.map((photo, index) => (
            <Box key={photo.id} sx={styles.photoItem}>
              <Box sx={styles.photoHeader}>
                <Typography variant="body2" sx={styles.typographyIndex} color="text.secondary">
                  {index === 0 ? 'Зображення 1' : `Зображення ${index + 1}`}
                </Typography>

                <Divider sx={styles.divider} />

                <IconButton
                  aria-label="Видалити зображення"
                  data-testid="delete-photo-btn"
                  onClick={() => setPhotoIdToDelete(photo.id)}
                  sx={styles.actionIcon}
                >
                  <TrashIcon />
                </IconButton>
              </Box>

              <ImagePreviewBlock
                imageUrl={photo.src}
                fileName={photo.fileName}
                altText={photo.altText}
                showAlternativeText
                stackSpacing="5px"
                onChangeAltText={(newAlt: string) => handleUpdatePhoto(photo.id, { altText: newAlt })}
                initialCrop={photo.crop}
                onChangeImage={(url: string, crop?: MediaModalResult['crop']) => {
                  handleUpdatePhoto(photo.id, {
                    src: url,
                    crop: crop ?? null
                  });
                }}
              />

              <Box sx={styles.captionWrapper}>
                <Box sx={styles.captionInputWrapper}>
                  <CustomTextField
                    label="Підпис до зображення"
                    value={photo.caption}
                    onChange={(e) => handleUpdatePhoto(photo.id, { caption: e.target.value })}
                    fullWidth
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={styles.addBtnWrapper}>
          <Button variant="outlined" color="primary" startIcon={<PlusIcon />} onClick={handleAddPhoto}>
            Додати пункт
          </Button>
        </Box>
      </Box>

      <DeleteCardModal
        open={Boolean(photoIdToDelete)}
        onClose={() => setPhotoIdToDelete(null)}
        onDelete={handleConfirmDelete}
        description="Ви збираєтесь видалити зображення. Ви впевнені, що хочете продовжити? "
      />
    </CollapsibleBlock>
  );
};
