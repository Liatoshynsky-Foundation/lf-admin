import sharp from 'sharp';

import { convertImageToSrgb } from '../imageProcessing';

describe('convertImageToSrgb', () => {
  it('converts JPEG images to sRGB and embeds an sRGB profile', async () => {
    const input = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
      .jpeg()
      .toBuffer();

    const output = await convertImageToSrgb(input, 'image/jpeg');
    const metadata = await sharp(output).metadata();

    expect(metadata.space).toBe('srgb');
    expect(metadata.icc).toEqual(expect.any(Buffer));
    expect(metadata.icc?.length).toBeGreaterThan(0);
  });

  it('leaves unsupported image formats unchanged', async () => {
    const input = Buffer.from('image');

    await expect(convertImageToSrgb(input, 'image/svg+xml')).resolves.toBe(input);
  });
});