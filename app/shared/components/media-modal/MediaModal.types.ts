import {CropResult} from '~/types/common';

export type MediaModalTab = 'GALLERY' | 'UPLOAD' | 'USED';
export type MediaModalStep = 'SELECT' | 'CROP';

export type Locale = 'uk' | 'en';

export type GalleryMedia = {
  kind: 'gallery';
  id: string;
  fileName: string;
  src: string;
  locale: Locale;
};

export type UsedMedia = {
  kind: 'used';
  id: string;
  fileName: string;
  src: string;
  locale: Locale;
};

export type UploadMedia = {
  kind: 'upload';
  id: string;
  fileName: string;
  file: File;
};

export type SelectedMedia = GalleryMedia | UsedMedia | UploadMedia;

export type MediaModalResult = {
  selected: SelectedMedia;
  crop: CropResult | null;
};

export type MediaModalOpenState = {
  tab?: MediaModalTab;
  step?: MediaModalStep;
  selected?: SelectedMedia | null;
  crop?: CropResult | null;
};
