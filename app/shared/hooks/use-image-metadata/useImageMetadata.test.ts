import { renderHook, waitFor } from '@testing-library/react';

import { useImageMetadata } from './useImageMetadata';

describe('useImageMetadata', () => {
  const mockImageWidth = 300;
  const mockImageHeight = 200;

  beforeAll(() => {
    Object.defineProperty(global, 'Image', {
      writable: true,
      value: class {
        width = mockImageWidth;
        height = mockImageHeight;
        onload: () => void = () => {};

        set src(val: string) {
          this._src = val;
          setTimeout(() => this.onload(), 0);
        }
        get src() {
          return this._src;
        }
        private _src = '';
      }
    });
  });

  it('should return dimensions and auto filename for given imageSrc', async () => {
    const testImageUrl = 'https://example.com/test-image.jpg';

    const { result } = renderHook(() => useImageMetadata(testImageUrl));

    await waitFor(() => {
      expect(result.current.dimensions).toEqual({
        width: mockImageWidth,
        height: mockImageHeight
      });
    });

    expect(result.current.fileName).toBe('test-image.jpg');
  });

  it('should use provided fileName instead of extracting from URL', async () => {
    const testImageUrl = 'https://example.com/test-image.jpg';
    const providedFileName = 'custom-name.png';

    const { result } = renderHook(() => useImageMetadata(testImageUrl, providedFileName));

    await waitFor(() => {
      expect(result.current.dimensions).toEqual({
        width: mockImageWidth,
        height: mockImageHeight
      });
    });

    expect(result.current.fileName).toBe(providedFileName);
  });

  it('should return null dimensions and empty filename if imageSrc is empty', () => {
    const { result } = renderHook(() => useImageMetadata(''));

    expect(result.current.dimensions).toBeNull();
    expect(result.current.fileName).toBe('');
  });
  it('should extract filename without query parameters', async () => {
    const imageUrlWithQuery = 'https://example.com/image.png?version=123';

    const { result } = renderHook(() => useImageMetadata(imageUrlWithQuery));

    await waitFor(() => {
      expect(result.current.dimensions).toEqual({
        width: mockImageWidth,
        height: mockImageHeight
      });
    });

    expect(result.current.fileName).toBe('image.png');
  });
});
