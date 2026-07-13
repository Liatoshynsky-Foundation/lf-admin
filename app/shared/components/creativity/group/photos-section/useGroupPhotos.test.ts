import { act, renderHook } from '@testing-library/react';

import { useGroupPhotos } from './useGroupPhotos';
import { GroupPhoto } from '~/constants/creativity';

describe('useGroupPhotos Hook', () => {
  const originalCrypto = global.crypto;

  beforeAll(() => {
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: () => 'mock-uuid-1234'
      },
      configurable: true
    });
  });

  afterAll(() => {
    Object.defineProperty(global, 'crypto', {
      value: originalCrypto,
      configurable: true
    });
  });

  const mockOnChange = jest.fn();
  
  const defaultPhotos: GroupPhoto[] = [
    { id: '1', src: 'img1.jpg', fileName: 'file1', caption: { uk: 'Caption 1', en: 'EN' }, altText: { uk: 'Alt 1', en: 'EN' }, crop: null }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with null photoIdToDelete', () => {
    const { result } = renderHook(() => useGroupPhotos(defaultPhotos, mockOnChange));
    
    expect(result.current.photoIdToDelete).toBeNull();
  });

  it('should return a correct photo key string based on crop presence', () => {
    const { result } = renderHook(() => useGroupPhotos(defaultPhotos, mockOnChange));
    
    const keyWithoutCrop = result.current.getPhotoKey(defaultPhotos[0]);
    expect(keyWithoutCrop).toBe('1-no-crop-img1.jpg');

    const photoWithCrop: GroupPhoto = { 
      ...defaultPhotos[0], 
      id: '2', 
      crop: { rect: { x: 10, y: 10, width: 100, height: 100 } } 
    };
    const keyWithCrop = result.current.getPhotoKey(photoWithCrop);
    expect(keyWithCrop).toBe('2-{"x":10,"y":10,"width":100,"height":100}-img1.jpg');
  });

  it('should add a new photo with a generated ID when handleAddPhoto is called', () => {
    const { result } = renderHook(() => useGroupPhotos(defaultPhotos, mockOnChange));
    
    act(() => {
      result.current.handleAddPhoto();
    });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith([
      ...defaultPhotos,
      { 
        id: 'mock-uuid-1234',
        src: '', 
        fileName: '', 
        caption: { uk: '', en: '' }, 
        altText: { uk: '', en: '' }, 
        crop: null 
      }
    ]);
  });

  it('should update a specific photo fields when handleUpdatePhoto is called', () => {
    const { result } = renderHook(() => useGroupPhotos(defaultPhotos, mockOnChange));
    
    act(() => {
      result.current.handleUpdatePhoto('1', { caption: { uk: 'Оновлений підпис', en: 'Updated Caption' } });
    });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith([
      { ...defaultPhotos[0], caption: { uk: 'Оновлений підпис', en: 'Updated Caption' } }
    ]);
  });

  it('should not update anything if handleUpdatePhoto is called with non-existent id', () => {
    const { result } = renderHook(() => useGroupPhotos(defaultPhotos, mockOnChange));
    
    act(() => {
      result.current.handleUpdatePhoto('non-existent-id', { caption: { uk: 'Оновлений підпис', en: 'Updated Caption' } });
    });

    expect(mockOnChange).toHaveBeenCalledWith(defaultPhotos);
  });

  it('should delete a photo and reset photoIdToDelete when handleConfirmDelete is called', () => {
    const { result } = renderHook(() => useGroupPhotos(defaultPhotos, mockOnChange));
    
    act(() => {
      result.current.setPhotoIdToDelete('1');
    });
    
    expect(result.current.photoIdToDelete).toBe('1');

    act(() => {
      result.current.handleConfirmDelete();
    });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith([]);
    
    expect(result.current.photoIdToDelete).toBeNull();
  });

  it('should do nothing on handleConfirmDelete if photoIdToDelete is null', () => {
    const { result } = renderHook(() => useGroupPhotos(defaultPhotos, mockOnChange));
    
    act(() => {
      result.current.handleConfirmDelete();
    });

    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
