import sharp from 'sharp';

const RASTER_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

export const convertImageToSrgb = async (buffer: Buffer, mimeType: string): Promise<Buffer> => {
  if (!RASTER_IMAGE_MIME_TYPES.has(mimeType)) {
    return buffer;
  }

  try {
    return await sharp(buffer).rotate().toColorspace('srgb').toBuffer();
  } catch {
    return buffer;
  }
};