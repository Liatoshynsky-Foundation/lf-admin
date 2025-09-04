import { PixelCrop } from 'react-image-crop';

import { cropperErrors } from '~/constants/errors';
import { Size } from '~/types/cropper';

export default async function getCroppedImg(
  imageSrc: string,
  crop: PixelCrop,
  outputSize: Size,
  oval: boolean
): Promise<{ dataUrl: string; blobUrl: string }> {
  if (crop.width === 0 || crop.height === 0) {
    throw new Error(cropperErrors.NO_FRAME);
  }
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize.width;
  canvas.height = outputSize.height;
  const ctx = canvas.getContext('2d');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  if (oval) {
    const tiltDeg = -20;
    const centerX = outputSize.width / 2;
    const centerY = outputSize.height / 2;
    const radiusX = outputSize.width / 2;
    const radiusY = (outputSize.height - 5) / 2;
    const rotation = (tiltDeg * Math.PI) / 180;

    ctx?.beginPath();
    ctx?.ellipse(centerX, centerY, radiusX, radiusY, rotation, 0, Math.PI * 2);
    ctx?.closePath();
    ctx?.clip();
  }

  ctx?.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const dataUrl = canvas.toDataURL('image/png');

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Canvas is empty');
      }
      const blobUrl = URL.createObjectURL(blob);
      resolve({ dataUrl, blobUrl });
    }, 'image/png');
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Load failed'));
    image.src = url;
  });
}
