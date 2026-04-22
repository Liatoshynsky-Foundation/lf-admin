import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { useCroppedImage } from './use-cropped-image';
import type { CropResult } from '~/types/common';

describe('useCroppedImage hook', () => {
  const containerW = 100;
  const containerH = 100;

  const mockCrop: CropResult = {
    rect: {
      x: 10,
      y: 20,
      width: 50,
      height: 50,
    },
  };

  it('should return default styles when crop is missing or natural size is 0', () => {
    const { result } = renderHook(() =>
      useCroppedImage(null, containerW, containerH)
    );

    expect(result.current.styles.container).toEqual({
      width: containerW,
      height: containerH,
      overflow: 'hidden',
      position: 'relative',
      flexShrink: 0,
    });

    expect(result.current.styles.image).toEqual({
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
      display: 'block',
    });
  });

  it('should update natural size and calculate styles on image load', () => {
    const { result } = renderHook(() =>
      useCroppedImage(mockCrop, containerW, containerH)
    );

    const mockEvent = {
      currentTarget: {
        naturalWidth: 500,
        naturalHeight: 300,
      },
    } as unknown as React.SyntheticEvent<HTMLImageElement>;

    act(() => {
      result.current.onLoad(mockEvent);
    });

    const { image } = result.current.styles;
    expect(image.width).toBe(500);
    expect(image.height).toBe(300);
    expect(image.transform).toContain('scale(2)');
    expect(image.transform).toContain('translate(-20px, -40px)');
  });

  it('should handle different aspect ratios and center the crop (Math.max scale)', () => {
    const narrowCrop: CropResult = {
      rect: { x: 0, y: 0, width: 50, height: 25 }
    };

    const { result } = renderHook(() =>
      useCroppedImage(narrowCrop, containerW, containerH)
    );

    const mockEvent = {
      currentTarget: { naturalWidth: 1000, naturalHeight: 1000 },
    } as unknown as React.SyntheticEvent<HTMLImageElement>;

    act(() => {
      result.current.onLoad(mockEvent);
    });

    expect(result.current.styles.image.transform).toContain('scale(4)');
    expect(result.current.styles.image.transform).toContain('translate(-50px, 0px)');
  });

  it('should return default styles if crop rect width or height is zero', () => {
    const brokenCrop: CropResult = {
      rect: { x: 10, y: 10, width: 0, height: 50 }
    };

    const { result } = renderHook(() =>
      useCroppedImage(brokenCrop, containerW, containerH)
    );

    const mockEvent = {
      currentTarget: { naturalWidth: 500, naturalHeight: 500 },
    } as unknown as React.SyntheticEvent<HTMLImageElement>;

    act(() => {
      result.current.onLoad(mockEvent);
    });

    expect(result.current.styles.image).toEqual({
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
      display: 'block',
    });
  });

  it('should return default styles if crop rect is missing', () => {
    const incompleteCrop = { someOtherData: {} } as unknown as CropResult;

    const { result } = renderHook(() =>
      useCroppedImage(incompleteCrop, containerW, containerH)
    );

    expect(result.current.styles.image.objectFit).toBe('cover');
  });

  it('should memoize styles when dependencies do not change', () => {
    const { result, rerender } = renderHook(
      ({ crop }) => useCroppedImage(crop, containerW, containerH),
      { initialProps: { crop: mockCrop } }
    );

    const firstStyles = result.current.styles;

    rerender({ crop: mockCrop });
    expect(result.current.styles).toBe(firstStyles);
  });
});
