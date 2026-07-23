import {
  formatBytes,
  formatMultipleUploadResults,
  generateFilenameWithOriginal,
  generateUniqueFilename,
  getExtensionFromFilename,
  getExtensionFromMimeType,
  parseUploadOptions,
  preserveOriginalFilenameSafely,
  sanitizeFilename,
} from '../utils';

describe('Upload Utils', () => {

  describe('sanitizeFilename', () => {
    it('should lowercase and replace spaces with underscores', () => {
      expect(sanitizeFilename('My File Name.PNG')).toBe('my_file_name.png');
    });

    it('should remove special characters and collapse multiple underscores', () => {
      expect(sanitizeFilename('file#name!@.jpg')).toBe('file_name_.jpg');
    });

    it('should handle multiple underscores by reducing them to one', () => {
      expect(sanitizeFilename('file___name.jpg')).toBe('file_name.jpg');
    });
  });

  describe('getExtensionFromMimeType', () => {
    it('should return correct extension for common types', () => {
      expect(getExtensionFromMimeType('image/jpeg')).toBe('jpg');
      expect(getExtensionFromMimeType('video/mp4')).toBe('mp4');
    });

    it('should return empty string for unknown mime type', () => {
      expect(getExtensionFromMimeType('application/x-unknown')).toBe('');
    });
  });

  describe('getExtensionFromFilename', () => {
    it('should return lowercase extension from filename', () => {
      expect(getExtensionFromFilename('Photo.JPEG')).toBe('jpeg');
    });

    it('should return empty string when filename has no extension', () => {
      expect(getExtensionFromFilename('README')).toBe('');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes into human-readable strings', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(512)).toBe('512 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('should respect custom decimal precision', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
    });
  });

  describe('generateUniqueFilename', () => {
    it('should generate a string containing a timestamp and hash', () => {
      const filename = generateUniqueFilename('test.jpg', 'image/jpeg');
      expect(filename).toMatch(/^\d+-[a-f0-9]+\.jpg$/);
    });

    it('should fallback to extension from filename if mime type is unknown', () => {
      const filename = generateUniqueFilename('manual.pdf', 'unknown/type');
      expect(filename).toContain('.pdf');
    });

    it('should generate a filename without extension if none can be resolved', () => {
      const filename = generateUniqueFilename('README', 'unknown/type');
      expect(filename).toMatch(/^\d+-[a-f0-9]+$/);
    });
  });

  describe('generateFilenameWithOriginal', () => {
    it('should include timestamp, hash, sanitized original name and original extension', () => {
      const filename = generateFilenameWithOriginal('My File.JPEG', 'image/jpeg');

      expect(filename).toMatch(/^\d+-[a-f0-9]{8}-my_file\.jpeg$/);
    });

    it('should omit extension when original name has no extension', () => {
      const filename = generateFilenameWithOriginal('README', 'text/plain');

      expect(filename).toMatch(/^\d+-[a-f0-9]{8}-readme$/);
    });
  });

  describe('preserveOriginalFilenameSafely', () => {
    it('should keep user-facing filename and original extension', () => {
      expect(preserveOriginalFilenameSafely(' Test_image_1.jpeg ', 'image/jpeg')).toBe('Test_image_1.jpeg');
      expect(preserveOriginalFilenameSafely('kitten.png', 'image/png')).toBe('kitten.png');
    });

    it('should replace path separators without lowercasing or changing extension', () => {
      expect(preserveOriginalFilenameSafely('folder\\Nested/File Name.JPEG', 'image/jpeg')).toBe(
        'folder_Nested_File Name.JPEG'
      );
    });

    it('should reject empty or separator-only names', () => {
      expect(() => preserveOriginalFilenameSafely('   ', 'image/png')).toThrow('Filename is required');
      expect(() => preserveOriginalFilenameSafely('///', 'image/png')).toThrow('Filename is required');
    });
  });

  describe('formatMultipleUploadResults', () => {
    it('should aggregate successful and failed results correctly', () => {
      const mockResults = [
        { success: true, filename: 'f1.jpg', originalName: 'o1.jpg', size: 100 },
        { success: false, originalName: 'o2.jpg', errors: ['Format error'] }
      ];
      const result = formatMultipleUploadResults(mockResults);

      expect(result.success).toBe(false);
      expect(result.data.uploaded).toBe(1);
      expect(result.data.failed).toBe(1);
    });

    it('should fallback to empty errors array for failed results without errors', () => {
      const result = formatMultipleUploadResults([
        { success: false, originalName: 'broken.jpg' }
      ]);

      expect(result.data.errors).toEqual([
        { originalName: 'broken.jpg', errors: [] }
      ]);
    });
  });

  describe('parseUploadOptions edge cases', () => {
    it('should throw error on invalid JSON string', () => {
      const body = { options: '{invalid-json}' };
      expect(() => parseUploadOptions(body)).toThrow();
    });

    it('should return empty object if options are missing', () => {
      expect(parseUploadOptions({})).toEqual({});
    });
  });
});
