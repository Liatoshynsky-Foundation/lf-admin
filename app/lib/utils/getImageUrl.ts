import { ImageBlock } from '~/types/common';

export function getImageUrl(image: ImageBlock) {
  const folder = image.isTmp ? 'tmp' : 'photos';
  return `/api/blob-url?folderName=${folder}&blobName=${image.src}`;
}
