import { fileNameFromUrl, isMediaItemFilled, mapMediaItemFromApi, resolveMediaName } from './compositionMedia';

describe('Media utility functions', () => {
  describe('resolveMediaName', () => {
    it('should return trimmed name if name is provided', () => {
      expect(resolveMediaName({ name: '  My Song.mp3  ', fileUrl: 'https://example.com/file.mp3' })).toBe('My Song.mp3');
    });

    it('should fallback to file name from URL if name is empty or missing', () => {
      expect(resolveMediaName({ name: '   ', fileUrl: 'https://example.com/path/audio-track.mp3?query=1' })).toBe('audio-track.mp3');
      expect(resolveMediaName({ name: null, fileUrl: 'https://example.com/doc.pdf' })).toBe('doc.pdf');
    });

    it('should return empty string if both name and fileUrl are missing/empty', () => {
      expect(resolveMediaName({ name: '', fileUrl: '' })).toBe('');
      expect(resolveMediaName({ name: null, fileUrl: null })).toBe('');
    });
  });

  describe('isMediaItemFilled', () => {
    it('should return true if name is filled', () => {
      expect(isMediaItemFilled({ name: 'Audio', fileUrl: '', publishDate: '' })).toBe(true);
      expect(isMediaItemFilled({ name: '   ', fileUrl: '', publishDate: '' })).toBe(false);
    });

    it('should return true if fileUrl is filled', () => {
      expect(isMediaItemFilled({ name: '', fileUrl: 'http://example.com', publishDate: '' })).toBe(true);
    });

    it('should return true if publishDate is filled', () => {
      expect(isMediaItemFilled({ name: '', fileUrl: '', publishDate: '2026' })).toBe(true);
      expect(isMediaItemFilled({ name: '', fileUrl: '', publishDate: '   ' })).toBe(false);
    });

    it('should return false if all fields are empty or missing', () => {
      expect(isMediaItemFilled({ name: '', fileUrl: null, publishDate: undefined })).toBe(false);
      expect(isMediaItemFilled({})).toBe(false);
    });
  });

  describe('mapMediaItemFromApi', () => {
    it('should map api item correctly using fallback for name', () => {
      const mockCreateId = jest.fn().mockReturnValue('test-id-1');
      const result = mapMediaItemFromApi(
        { name: null, url: 'https://example.com/track.mp3?v=1', publishDate: '2025' },
        mockCreateId
      );

      expect(result).toEqual({
        id: 'test-id-1',
        name: 'track.mp3',
        fileUrl: 'https://example.com/track.mp3?v=1',
        publishDate: '2025'
      });
      expect(mockCreateId).toHaveBeenCalledTimes(1);
    });

    it('should use provided item name over url filename', () => {
      const mockCreateId = jest.fn().mockReturnValue('test-id-2');
      const result = mapMediaItemFromApi(
        { name: 'Custom Name', url: 'https://example.com/track.mp3' },
        mockCreateId
      );

      expect(result.name).toBe('Custom Name');
      expect(result.publishDate).toBe('');
    });
  });

  describe('fileNameFromUrl', () => {
    it('should extract file name and strip query params', () => {
      expect(fileNameFromUrl('https://site.com/folder/file.ext?token=abc')).toBe('file.ext');
    });

    it('should return empty string for null or undefined', () => {
      expect(fileNameFromUrl(null)).toBe('');
      expect(fileNameFromUrl(undefined)).toBe('');
    });
  });
});
