import { Box, Divider, IconButton, Typography } from '@mui/material';

import { styles } from './GroupPhotosSection.styles';
import { useGroupPhotos } from './useGroupPhotos';
import { GroupPhoto } from '~/constants/creativity';
import { EditorLanguage } from '~/constants/publications';
import PlusIcon from '~/public/icons/plus.svg';
import TrashIcon from '~/public/icons/trash.svg';
import DeleteCardModal from '~/shared/components/delete-card-modal/DeleteCardModal';
import Button from '~/shared/components/design-system/button/Button';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import type { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

type GroupPhotosSectionProps = {
  photos: GroupPhoto[];
  currentLanguage: EditorLanguage;
  onChange: (photos: GroupPhoto[]) => void;
};

export const GroupPhotosSection = ({ photos, currentLanguage, onChange }: GroupPhotosSectionProps) => {
  const {
    photoIdToDelete,
    setPhotoIdToDelete,
    handleAddPhoto,
    handleUpdatePhoto,
    handleConfirmDelete
  } = useGroupPhotos(photos, onChange);

  const langKey = currentLanguage === 'UA' ? 'uk' : 'en';

  return (
    <>
      <Box sx={styles.mainContainer}>
        <Box sx={styles.photosList}>
          {photos.map((photo, index) => (
            <Box key={photo.id} sx={styles.photoItem}>
              <Box sx={styles.photoHeader}>
                <Typography variant="body2" sx={styles.typographyIndex} color="text.secondary">
                  {`Зображення ${index + 1}`}
                </Typography>

                <Divider sx={styles.divider} />

                <IconButton
                  aria-label="Видалити зображення"
                  data-testid="delete-photo-btn"
                  onClick={() => setPhotoIdToDelete(photo.id || '')}
                  sx={styles.actionIcon}
                >
                  <TrashIcon />
                </IconButton>
              </Box>

              <ImagePreviewBlock
                key={`preview-${photo.id}-${photo.src}`}
                imageUrl={photo.src || ''}
                fileName={photo.fileName}
                altText={photo.altText?.[langKey] || ''}
                showAlternativeText
                stackSpacing="5px"
                onChangeAltText={(newAlt: string) => {
                  handleUpdatePhoto(photo.id || '', { 
                    altText: { ...photo.altText, [langKey]: newAlt } 
                  });
                }}
                initialCrop={photo.crop}
                onChangeImage={(url: string, crop?: MediaModalResult['crop']) => {
                  handleUpdatePhoto(photo.id || '', {
                    src: url,
                    crop: crop ?? null
                  });
                }}
              />

              <Box sx={styles.captionWrapper}>
                <Box sx={styles.captionInputWrapper}>
                  <CustomTextField
                    label="Підпис до зображення"
                    value={photo.caption?.[langKey] || ''}
                    onChange={(e) => {
                      handleUpdatePhoto(photo.id || '', { 
                        caption: { ...photo.caption, [langKey]: e.target.value } 
                      });
                    }}
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
    </>
  );
};
