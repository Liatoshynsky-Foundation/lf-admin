import { Box, Divider,IconButton, Typography } from '@mui/material';

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
  errors?: Record<string, string>;
  onChange: (photos: GroupPhoto[]) => void;
};

export const GroupPhotosSection = ({ photos, currentLanguage, errors, onChange }: GroupPhotosSectionProps) => {
  const { photoIdToDelete, setPhotoIdToDelete, handleAddPhoto, handleUpdatePhoto, handleConfirmDelete } =
    useGroupPhotos(photos, onChange);

  const langKey = currentLanguage === 'UA' ? 'uk' : 'en';

  return (
    <>
      <Box sx={styles.mainContainer}>
        <Box sx={styles.photosList}>
          {photos.map((photo, index) => {
            const altTextValue = photo.altText?.[langKey] || '';
            const srcValue = photo.src || '';
            const altTextError = errors?.[`photos[${photo.id}].altText.${langKey}`];
            const showAltTextError = Boolean(altTextError && srcValue && altTextValue.trim().length < 2);

            const captionValue = photo.caption?.[langKey] || '';
            const captionError = errors?.[`photos[${photo.id}].caption.${langKey}`];
            const showCaptionError = Boolean(
              captionError && captionValue.trim().length > 0 && captionValue.trim().length < 2
            );
            return (
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

                <Box>
                  <ImagePreviewBlock
                    key={`preview-${photo.id}-${photo.src}`}
                    imageUrl={srcValue}
                    fileName={photo.fileName}
                    altText={altTextValue}
                    showAlternativeText
                    stackSpacing="5px"
                    altTextErrorState={showAltTextError}
                    altTextError={showAltTextError ? altTextError : undefined}
                    onChangeAltText={(newAlt: string) => {
                      const currentUk = photo.altText?.uk || '';
                      const currentEn = photo.altText?.en || '';

                      const newAltText = { uk: currentUk, en: currentEn, [langKey]: newAlt };

                      if (langKey === 'uk' && (!currentEn || currentEn === currentUk)) {
                        newAltText.en = newAlt;
                      }

                      handleUpdatePhoto(photo.id || '', {
                        altText: newAltText
                      });
                    }}
                    onBlurAltText={() => {
                      const currentUk = photo.altText?.uk || '';
                      const currentEn = photo.altText?.en || '';

                      handleUpdatePhoto(photo.id || '', {
                        altText: {
                          uk: currentUk.trim(),
                          en: currentEn.trim()
                        }
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
                </Box>

                <Box sx={styles.captionWrapper}>
                  <Box sx={styles.captionInputWrapper}>
                    <CustomTextField
                      label="Підпис до зображення"
                      value={captionValue}
                      onChange={(e) => {
                        const newCaptionValue = e.target.value;
                        const currentUk = photo.caption?.uk || '';
                        const currentEn = photo.caption?.en || '';
                        const newCaptionObj = { uk: currentUk, en: currentEn, [langKey]: newCaptionValue };
                        if (langKey === 'uk' && (!currentEn || currentEn === currentUk)) {
                          newCaptionObj.en = newCaptionValue;
                        }
                        handleUpdatePhoto(photo.id || '', {
                          caption: newCaptionObj
                        });
                      }}
                      onBlur={() => {
                        const currentUk = photo.caption?.uk || '';
                        const currentEn = photo.caption?.en || '';

                        handleUpdatePhoto(photo.id || '', {
                          caption: {
                            uk: currentUk.trim(),
                            en: currentEn.trim()
                          }
                        });
                      }}
                      fullWidth
                      error={showCaptionError}
                      helperText={showCaptionError ? captionError : undefined}
                      inputProps={{ maxLength: 250 }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
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
