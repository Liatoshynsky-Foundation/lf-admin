import { Box, Divider, IconButton, Typography } from '@mui/material';
import { useState } from 'react';

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

type OpusPhotosSectionProps = {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
};

export const OpusPhotosSection = ({ photos, onChange }: OpusPhotosSectionProps) => {
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

  const handleUpdatePhoto = <K extends keyof PhotoItem>(idToUpdate: string, field: K, value: PhotoItem[K]) => {
    onChange(photos.map((photo) => (photo.id === idToUpdate ? { ...photo, [field]: value } : photo)));
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {photos.map((photo, index) => (
            <Box key={photo.id} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }} color="text.secondary">
                  {index === 0 ? 'Зображення 1' : `Зображення ${index + 1}`}
                </Typography>

                <Divider sx={{ flexGrow: 1, borderColor: '#E0E2E8' }} />

                <IconButton
                  onClick={() => setPhotoIdToDelete(photo.id)}
                  sx={{
                    color: '#131414',
                    width: '34px',
                    height: '34px',
                  }}
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
                onChangeAltText={(newAlt: string) => handleUpdatePhoto(photo.id, 'altText', newAlt)}
                initialCrop={photo.crop}
                onChangeImage={(url: string, crop?: MediaModalResult['crop']) => {
                  handleUpdatePhoto(photo.id, 'src', url);
                  handleUpdatePhoto(photo.id, 'crop', crop ?? null);
                }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <CustomTextField
                    label="Підпис до зображення"
                    value={photo.caption}
                    onChange={(e) => handleUpdatePhoto(photo.id, 'caption', e.target.value)}
                    fullWidth
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PlusIcon />}
            onClick={handleAddPhoto}
            sx={{ borderRadius: '20px', textTransform: 'none' }}
          >
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
