import { JsonValue } from '~/back-shared/types/pages/types';
import { CropRect } from '~/infrastructure/models/imageCrop.model';

export interface ImageWithCrop {
  src: string;
  crop?: CropRect;
}

export const extractImagesWithMetadata = (data: JsonValue): ImageWithCrop[] => {
  const images: ImageWithCrop[] = [];

  const findRecursively = (value: unknown) => {
    if (!value || typeof value !== 'object') return;

    if (Array.isArray(value)) {
      value.forEach(findRecursively);
      return;
    }

    const obj = value as Record<string, unknown>;

    if (typeof obj.src === 'string' && obj.crop) {
      images.push({
        src: obj.src,
        crop: obj.crop as CropRect
      });
    }

    Object.values(obj).forEach(findRecursively);
  };

  findRecursively(data);
  return images;
};

export const extractImageSrcs = (data: JsonValue): string[] => {
  const tmpSrcs: string[] = [];

  const findRecursively = (value: unknown) => {
    if (!value || typeof value !== 'object') return;

    if (Array.isArray(value)) {
      value.forEach(findRecursively);
      return;
    }

    const obj = value as Record<string, unknown>;

    if (typeof obj.src === 'string' && obj.isTmp === true) {
      tmpSrcs.push(obj.src);
    }

    Object.values(obj).forEach(findRecursively);
  };

  findRecursively(data);
  return Array.from(new Set(tmpSrcs));
};