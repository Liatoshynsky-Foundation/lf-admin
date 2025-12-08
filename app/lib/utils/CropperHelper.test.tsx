import { PixelCrop } from 'react-image-crop';

import getCroppedImg from './CropperHelper';

describe('Cropper helper', () => {
  beforeEach(() => {
    global.Image = class {
      width = 100;
      height = 100;
      naturalWidth = 100;
      naturalHeight = 100;
      onload: () => void = () => {};
      onerror: () => void = () => {};
      set src(_src: string) {
        setTimeout(() => this.onload(), 0);
      }
      setAttribute: () => void = () => {};
    } as any;

    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake');
  });

  const crop: PixelCrop = { x: 10, y: 10, width: 50, height: 50, unit: 'px' };
  const outputSize = { width: 100, height: 100 };

  it('should render dataUrl and blobUrl from a crop', async () => {
    Object.defineProperty(document, 'createElement', {
      value: (tag: string) => {
        if (tag === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: () => ({
              drawImage: jest.fn()
            }),
            toDataURL: () => 'data:image/jpeg;base64,fake',
            toBlob: (cb: (blob: Blob | null) => void) => cb(new Blob())
          };
        }
        return document.createElement(tag);
      },
      configurable: true
    });
    const result = await getCroppedImg('https://example.com/image.jpg', crop, outputSize, false);

    expect(result.dataUrl).toMatch(/^data:image\/jpeg/);
    expect(result.blobUrl).toMatch(/^blob:/);
  });

  it('should throw an error if canvas are empty', async () => {
    Object.defineProperty(document, 'createElement', {
      value: (tag: string) => {
        if (tag === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: () => ({
              drawImage: jest.fn()
            }),
            toDataURL: () => 'data:image/jpeg;base64,fake',
            toBlob: (cb: (blob: Blob | null) => void) => cb(null)
          };
        }
        return document.createElement(tag);
      },
      configurable: true
    });
    await expect(getCroppedImg('https://example.com/image.jpg', crop, outputSize, false)).rejects.toThrow(
      'Canvas is empty'
    );
  });

  it('should throw an error if image fails to load', async () => {
    global.Image = class {
      onload = () => {};
      onerror = (_e: any) => {};
      set src(_src: string) {
        setTimeout(() => this.onerror(new Error('Load failed')), 0);
      }
      setAttribute = () => {};
    } as any;

    await expect(getCroppedImg('https://example.com/invalid.jpg', crop, outputSize, false)).rejects.toThrow(
      'Load failed'
    );
  });
});
