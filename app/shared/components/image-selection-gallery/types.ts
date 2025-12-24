export interface GalleryImage {
  id: string;
  src: string;
  name: string;
  alt?: string;
  width: number;
  height: number;
  uploadedAt?: Date;
  languageVersion?: 'uk' | 'en' | null;
}

export interface ImageSelectionGalleryProps {
  images: GalleryImage[];
  selectedImageId?: string | null;
  onSelectImage: (image: GalleryImage | null) => void;
  currentlyUsedImageId?: string | null;
}

export interface ImageCardProps {
  image: GalleryImage;
  isSelected: boolean;
  isCurrentlyUsed: boolean;
  onClick: () => void;
}
