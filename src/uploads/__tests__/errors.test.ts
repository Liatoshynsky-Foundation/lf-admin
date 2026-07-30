import { ensureError, UPLOAD_ERRORS } from '../errors';

describe('Upload Errors', () => {
  describe('ensureError', () => {
    it('should return the original error if it is an instance of Error', () => {
      const error = new Error('Custom error');
      const result = ensureError(error);

      expect(result).toBe(error);
      expect(result.message).toBe('Custom error');
    });

    it('should return a new Error with UNKNOWN_ERROR_OCCURRED message if input is not an Error', () => {
      const nonErrorInputs = ['String error', 123, { error: 'object' }, null, undefined];

      nonErrorInputs.forEach((input) => {
        const result = ensureError(input);
        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe(UPLOAD_ERRORS.UNKNOWN_ERROR_OCCURRED);
      });
    });
  });

  describe('UPLOAD_ERRORS template functions', () => {
    it('should format FILE_ALREADY_EXISTS message correctly', () => {
      expect(UPLOAD_ERRORS.FILE_ALREADY_EXISTS('doc.pdf')).toBe('Файл doc.pdf вже існує');
    });

    it('should format FILE_SIZE_EXCEEDED message correctly', () => {
      expect(UPLOAD_ERRORS.FILE_SIZE_EXCEEDED(2000, 1000)).toBe(
        'File size 2000 bytes exceeds maximum allowed size 1000 bytes'
      );
    });

    it('should format MIME_TYPE_NOT_ALLOWED message correctly', () => {
      expect(UPLOAD_ERRORS.MIME_TYPE_NOT_ALLOWED('text/plain', ['image/png', 'image/jpeg'])).toBe(
        'MIME type text/plain is not allowed. Allowed types: image/png, image/jpeg'
      );
    });

    it('should format EXTENSION_NOT_ALLOWED message correctly', () => {
      expect(UPLOAD_ERRORS.EXTENSION_NOT_ALLOWED('exe', ['png', 'jpg'])).toBe(
        'File extension .exe is not allowed. Allowed extensions: png, jpg'
      );
    });

    it('should format CLOUD_STORAGE_NOT_IMPLEMENTED message correctly', () => {
      expect(UPLOAD_ERRORS.CLOUD_STORAGE_NOT_IMPLEMENTED('gcp')).toBe('Cloud storage for gcp not yet implemented');
    });

    it('should format CLOUD_STORAGE_REQUIRES_CREDENTIALS message correctly', () => {
      expect(UPLOAD_ERRORS.CLOUD_STORAGE_REQUIRES_CREDENTIALS('cloudflare')).toBe(
        'cloudflare storage requires accessKeyId and secretAccessKey'
      );
    });

    it('should format UNKNOWN_STORAGE_TYPE message correctly', () => {
      expect(UPLOAD_ERRORS.UNKNOWN_STORAGE_TYPE('custom-storage')).toBe('Unknown storage type: custom-storage');
    });
  });
});
