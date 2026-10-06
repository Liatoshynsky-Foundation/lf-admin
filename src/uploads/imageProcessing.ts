import sharp from 'sharp';

const SRGB_CONVERTIBLE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png']);

export const convertImageToSrgb = async (buffer: Buffer, mimeType: string): Promise<Buffer> => {
  if (!SRGB_CONVERTIBLE_MIME_TYPES.has(mimeType)) {
    return buffer;
  }

  try {
    return await sharp(buffer).toColorspace('srgb').withMetadata({ icc: 'srgb' }).toBuffer();
  } catch {
    return buffer;
  }
};