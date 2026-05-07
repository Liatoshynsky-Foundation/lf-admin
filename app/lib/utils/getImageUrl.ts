import { ImageBlock } from '~/types/common';

export function getImageUrl(image: ImageBlock) {
  if (image.src.startsWith('http://') || image.src.startsWith('https://')) {
    return image.src;
  }

  const folder = image.isTmp ? 'tmp' : 'photos';
  return `/api/blob-url?folderName=${folder}&blobName=${image.src}`;
}
