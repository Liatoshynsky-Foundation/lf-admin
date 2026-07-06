import { useState } from 'react';

import { GroupPhoto } from '~/constants/creativity';
import { generateUniqueId } from '~/lib/utils/generateUniqueId';

export const useGroupPhotos = (photos: GroupPhoto[], onChange: (photos: GroupPhoto[]) => void) => {
  const [photoIdToDelete, setPhotoIdToDelete] = useState<string | null>(null);

  const getPhotoKey = (photo: GroupPhoto) => {
    const cropStr = photo.crop?.rect ? JSON.stringify(photo.crop.rect) : 'no-crop';
    return `${photo.id}-${cropStr}`;
  };

  const handleAddPhoto = () => {
    const newPhoto: GroupPhoto = {
      id: generateUniqueId(),
      src: '',
      fileName: '',
      caption: '',
      altText: '',
      crop: null
    };
    onChange([...photos, newPhoto]);
  };

  const handleUpdatePhoto = (idToUpdate: string, updates: Partial<GroupPhoto>) => {
    onChange(photos.map((photo) => (photo.id === idToUpdate ? { ...photo, ...updates } : photo)));
  };

  const handleConfirmDelete = () => {
    if (photoIdToDelete) {
      onChange(photos.filter((photo) => photo.id !== photoIdToDelete));
      setPhotoIdToDelete(null);
    }
  };

  return {
    photoIdToDelete,
    setPhotoIdToDelete,
    getPhotoKey,
    handleAddPhoto,
    handleUpdatePhoto,
    handleConfirmDelete
  };
};
