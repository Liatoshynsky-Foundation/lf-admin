import sharp from 'sharp';

import { convertImageToSrgb } from '../imageProcessing';

describe('convertImageToSrgb', () => {
  it('converts JPEG images to sRGB and strips metadata', async () => {
    const input = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
      .withMetadata({ exif: { IFD0: { Artist: 'Test photographer' } } })
      .jpeg()
      .toBuffer();

    const output = await convertImageToSrgb(input, 'image/jpeg');
    const metadata = await sharp(output).metadata();

    expect(metadata.space).toBe('srgb');
    expect(metadata.exif).toBeUndefined();
    expect(metadata.iptc).toBeUndefined();
    expect(metadata.xmp).toBeUndefined();
    expect(metadata.comments).toBeUndefined();
  });

  it('leaves SVG images unchanged', async () => {
    const input = Buffer.from('image');

    await expect(convertImageToSrgb(input, 'image/svg+xml')).resolves.toBe(input);
  });
});