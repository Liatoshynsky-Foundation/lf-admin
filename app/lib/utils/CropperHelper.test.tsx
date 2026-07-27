import { PixelCrop } from 'react-image-crop';

import getCroppedImg, {
  buildCoverImageCropPayload,
  isCropRect,
  isLocalizedCropRect,
  normalizeFetchedCrop
} from './CropperHelper';
import { cropperErrors } from '~/constants/errors';
import { CropRect, LocalizedCropRect } from '~/types/common';
import { Size } from '~/types/cropper';

const realCreateElement = document.createElement;

describe('Cropper helper', () => {
  let createElementSpy: jest.SpyInstance;
  const originalFetch = globalThis.fetch;
  const originalImage = globalThis.Image;
  const originalCreateObjectURL = globalThis.URL.createObjectURL;

  beforeEach(() => {
    createElementSpy = jest.spyOn(document, 'createElement');

    const MockImage = class {
      width = 100;
      height = 100;
      naturalWidth = 100;
      naturalHeight = 100;
      onload: () => void = () => {};
      onerror: (err: Error) => void = () => {};
      private _src = '';
      set src(src: string) {
        this._src = src;
        setTimeout(() => this.onload(), 0);
      }
      get src(): string {
        return this._src;
      }
      setAttribute(_name: string, _value: string): void {}
    };

    globalThis.Image = MockImage as unknown as typeof Image;
    globalThis.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.Image = originalImage;
    globalThis.URL.createObjectURL = originalCreateObjectURL;
    jest.restoreAllMocks();
  });

  const crop: PixelCrop = { x: 10, y: 10, width: 50, height: 50, unit: 'px' };
  const outputSize: Size = { width: 100, height: 100 };

  it('should render dataUrl and blobUrl from a crop', async () => {
    createElementSpy.mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            drawImage: jest.fn()
          }),
          toDataURL: () => 'data:image/jpeg;base64,fake',
          toBlob: (cb: (blob: Blob | null) => void) => cb(new Blob())
        } as unknown as HTMLCanvasElement;
      }
      return realCreateElement.call(document, tag);
    });

    const result = await getCroppedImg('https://example.com/image.jpg', crop, outputSize, false);

    expect(result.dataUrl).toMatch(/^data:image\/jpeg/);
    expect(result.blobUrl).toMatch(/^blob:/);
  });

  it('should apply oval clip path when oval option is true', async () => {
    const ellipseMock = jest.fn();
    const clipMock = jest.fn();
    const beginPathMock = jest.fn();
    const closePathMock = jest.fn();

    createElementSpy.mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            beginPath: beginPathMock,
            ellipse: ellipseMock,
            closePath: closePathMock,
            clip: clipMock,
            drawImage: jest.fn()
          }),
          toDataURL: () => 'data:image/png;base64,fake',
          toBlob: (cb: (blob: Blob | null) => void) => cb(new Blob())
        } as unknown as HTMLCanvasElement;
      }
      return realCreateElement.call(document, tag);
    });

    const result = await getCroppedImg('https://example.com/image.jpg', crop, outputSize, true);

    expect(ellipseMock).toHaveBeenCalled();
    expect(clipMock).toHaveBeenCalled();
    expect(beginPathMock).toHaveBeenCalled();
    expect(closePathMock).toHaveBeenCalled();
    expect(result.dataUrl).toBe('data:image/png;base64,fake');
  });

  it('should throw an error if crop width or height is zero', async () => {
    const zeroCrop: PixelCrop = { x: 10, y: 10, width: 0, height: 50, unit: 'px' };
    await expect(getCroppedImg('https://example.com/image.jpg', zeroCrop, outputSize, false)).rejects.toThrow(
      cropperErrors.NO_FRAME
    );
  });

  it('should throw an error if canvas is empty', async () => {
    createElementSpy.mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            drawImage: jest.fn()
          }),
          toDataURL: () => 'data:image/jpeg;base64,fake',
          toBlob: (cb: (blob: Blob | null) => void) => cb(null)
        } as unknown as HTMLCanvasElement;
      }
      return realCreateElement.call(document, tag);
    });

    await expect(getCroppedImg('https://example.com/image.jpg', crop, outputSize, false)).rejects.toThrow(
      'Canvas is empty'
    );
  });

  it('should throw an error if image fails to load', async () => {
    const FailingImageMock = class {
      onload = () => {};
      onerror = (_err: Error) => {};
      set src(_src: string) {
        setTimeout(() => this.onerror(new Error('Load failed')), 0);
      }
      setAttribute(_name: string, _value: string): void {}
    };

    globalThis.Image = FailingImageMock as unknown as typeof Image;

    await expect(getCroppedImg('https://example.com/invalid.jpg', crop, outputSize, false)).rejects.toThrow(
      'Load failed'
    );
  });

  describe('isCropRect', () => {
    it('should return true for a valid CropRect', () => {
      const rect: CropRect = { x: 10, y: 20, width: 100, height: 200 };
      expect(isCropRect(rect)).toBe(true);
    });

    it('should return false for invalid structures or values', () => {
      expect(isCropRect(null)).toBe(false);
      expect(isCropRect(undefined)).toBe(false);
      expect(isCropRect('string')).toBe(false);
      expect(isCropRect(123)).toBe(false);
      expect(isCropRect({})).toBe(false);
      expect(isCropRect({ x: '10', y: 20, width: 100, height: 200 })).toBe(false);
    });
  });

  describe('isLocalizedCropRect', () => {
    it('should return true if uk or en keys exist inside an object', () => {
      expect(isLocalizedCropRect({ uk: { x: 1, y: 2, width: 3, height: 4 } })).toBe(true);
      expect(isLocalizedCropRect({ en: { x: 1, y: 2, width: 3, height: 4 } })).toBe(true);
    });

    it('should return false for null, undefined or non-localized structures', () => {
      expect(isLocalizedCropRect(null)).toBe(false);
      expect(isLocalizedCropRect(undefined)).toBe(false);
      expect(isLocalizedCropRect([])).toBe(false);
      expect(isLocalizedCropRect({ fr: {} })).toBe(false);
    });
  });

  describe('buildCoverImageCropPayload', () => {
    const rect: CropRect = { x: 10, y: 20, width: 100, height: 200 };

    it('should return empty object if crop is falsy', () => {
      expect(buildCoverImageCropPayload(null)).toEqual({});
      expect(buildCoverImageCropPayload(undefined)).toEqual({});
    });

    it('should build payload with fallback from localized crop', () => {
      const localized: LocalizedCropRect = { uk: rect, en: null };
      expect(buildCoverImageCropPayload(localized)).toEqual({
        crop: rect,
        localizedCrop: localized
      });
    });

    it('should return empty object if localized crop contains no falling back crop Rect', () => {
      const emptyLocalized: LocalizedCropRect = { uk: null, en: null };
      expect(buildCoverImageCropPayload(emptyLocalized)).toEqual({});
    });

    it('should return crop directly if it is a flat CropRect', () => {
      expect(buildCoverImageCropPayload(rect)).toEqual({ crop: rect });
    });

    it('should return empty object for completely unknown structures', () => {
      expect(buildCoverImageCropPayload({ unknownField: true })).toEqual({});
    });
  });

  describe('normalizeFetchedCrop', () => {
    const rect: CropRect = { x: 10, y: 20, width: 100, height: 200 };

    it('should return null if crop is falsy', () => {
      expect(normalizeFetchedCrop(null)).toBeNull();
      expect(normalizeFetchedCrop(undefined)).toBeNull();
    });

    it('should normalize valid LocalizedCropRect fields (uk is truthy, en is null)', () => {
      const localized: LocalizedCropRect = { uk: rect, en: null };
      expect(normalizeFetchedCrop(localized)).toEqual({
        uk: rect,
        en: null
      });
    });

    it('should normalize valid LocalizedCropRect fields (uk is null, en is truthy)', () => {
      const localized: LocalizedCropRect = { uk: null, en: rect };
      expect(normalizeFetchedCrop(localized)).toEqual({
        uk: null,
        en: rect
      });
    });

    it('should replicate non-localized CropRect into both locales', () => {
      expect(normalizeFetchedCrop(rect)).toEqual({
        uk: rect,
        en: rect
      });
    });

    it('should return null for any invalid structure', () => {
      expect(normalizeFetchedCrop({ unknownField: true })).toBeNull();
    });
  });
});
