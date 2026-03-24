import {
  formatBytes,
  formatMultipleUploadResults,
  generateUniqueFilename,
  getExtensionFromMimeType,
  parseUploadOptions,
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

  describe('formatBytes', () => {
    it('should format bytes into human-readable strings', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
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