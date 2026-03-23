import {
  createImageValidator,
  DEFAULT_IMAGE_RULES,
  IMAGE_EXTENSIONS,
  IMAGE_MIME_TYPES,
  ImageValidationRules
} from '../imageValidator';

const createTestBuffer = (sizeInBytes: number) => Buffer.alloc(sizeInBytes);
const createValidImageFile = () => ({
  buffer: createTestBuffer(1024),
  filename: 'test-image.jpg',
  mimeType: 'image/jpeg'
});

describe('IMAGE_MIME_TYPES', () => {
  it('should contain common image mime types', () => {
    expect(IMAGE_MIME_TYPES).toContain('image/jpeg');
    expect(IMAGE_MIME_TYPES).toContain('image/jpg');
    expect(IMAGE_MIME_TYPES).toContain('image/png');
    expect(IMAGE_MIME_TYPES).toContain('image/gif');
    expect(IMAGE_MIME_TYPES).toContain('image/webp');
    expect(IMAGE_MIME_TYPES).toContain('image/svg+xml');
    expect(IMAGE_MIME_TYPES).toContain('image/bmp');
  });
});

describe('IMAGE_EXTENSIONS', () => {
  it('should contain common image extensions', () => {
    expect(IMAGE_EXTENSIONS).toContain('jpg');
    expect(IMAGE_EXTENSIONS).toContain('jpeg');
    expect(IMAGE_EXTENSIONS).toContain('png');
    expect(IMAGE_EXTENSIONS).toContain('gif');
    expect(IMAGE_EXTENSIONS).toContain('webp');
    expect(IMAGE_EXTENSIONS).toContain('svg');
    expect(IMAGE_EXTENSIONS).toContain('bmp');
  });
});

describe('DEFAULT_IMAGE_RULES', () => {
  it('should have sensible default values', () => {
    expect(DEFAULT_IMAGE_RULES.maxSize).toBe(10 * 1024 * 1024); // 10MB
    expect(DEFAULT_IMAGE_RULES.allowedMimeTypes).toEqual(IMAGE_MIME_TYPES);
    expect(DEFAULT_IMAGE_RULES.allowedExtensions).toEqual(IMAGE_EXTENSIONS);
    expect(DEFAULT_IMAGE_RULES.maxWidth).toBe(4096);
    expect(DEFAULT_IMAGE_RULES.maxHeight).toBe(4096);
  });
});

describe('createImageValidator', () => {
  describe('with default rules', () => {
    it('should validate a valid image file', async () => {
      const validator = createImageValidator();
      const { buffer, filename, mimeType } = createValidImageFile();

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept all supported image mime types', async () => {
      const validator = createImageValidator();
      const buffer = createTestBuffer(1024);
      const mimeTypes = [
        { mime: 'image/jpeg', filename: 'test.jpg' },
        { mime: 'image/png', filename: 'test.png' },
        { mime: 'image/gif', filename: 'test.gif' },
        { mime: 'image/webp', filename: 'test.webp' },
        { mime: 'image/svg+xml', filename: 'test.svg' },
        { mime: 'image/bmp', filename: 'test.bmp' }
      ];

      for (const { mime, filename } of mimeTypes) {
        const result = await validator.validate(buffer, filename, mime);
        expect(result.valid).toBe(true);
      }
    });

    it('should reject files exceeding max size', async () => {
      const validator = createImageValidator();
      const buffer = createTestBuffer(11 * 1024 * 1024); // 11MB
      const filename = 'large-image.jpg';
      const mimeType = 'image/jpeg';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('exceeds maximum allowed size');
    });

    it('should reject unsupported mime types', async () => {
      const validator = createImageValidator();
      const buffer = createTestBuffer(1024);
      const filename = 'document.pdf';
      const mimeType = 'application/pdf';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((error) => error.includes('MIME type'))).toBe(true);
    });

    it('should reject unsupported file extensions', async () => {
      const validator = createImageValidator();
      const buffer = createTestBuffer(1024);
      const filename = 'document.txt';
      const mimeType = 'image/jpeg'; // Valid mime but wrong extension

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((error) => error.includes('extension'))).toBe(true);
    });

    it('should accumulate multiple validation errors', async () => {
      const validator = createImageValidator();
      const buffer = createTestBuffer(11 * 1024 * 1024); // Too large
      const filename = 'document.txt'; // Wrong extension
      const mimeType = 'application/pdf'; // Wrong mime type

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('with custom rules', () => {
    it('should accept custom max size', async () => {
      const customRules: ImageValidationRules = {
        ...DEFAULT_IMAGE_RULES,
        maxSize: 500
      };
      const validator = createImageValidator(customRules);
      const buffer = createTestBuffer(1000);
      const filename = 'test.jpg';
      const mimeType = 'image/jpeg';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('500 bytes'))).toBe(true);
    });

    it('should accept custom allowed mime types', async () => {
      const customRules: ImageValidationRules = {
        ...DEFAULT_IMAGE_RULES,
        allowedMimeTypes: ['image/png']
      };
      const validator = createImageValidator(customRules);
      const buffer = createTestBuffer(1024);
      const filename = 'test.jpg';
      const mimeType = 'image/jpeg';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('MIME type'))).toBe(true);
    });

    it('should accept custom allowed extensions', async () => {
      const customRules: ImageValidationRules = {
        ...DEFAULT_IMAGE_RULES,
        allowedExtensions: ['png', 'gif']
      };
      const validator = createImageValidator(customRules);
      const buffer = createTestBuffer(1024);
      const filename = 'test.jpg';
      const mimeType = 'image/jpeg';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('extension'))).toBe(true);
    });

    it('should work with minimal custom rules', async () => {
      const customRules: ImageValidationRules = {
        maxSize: 2048
      };
      const validator = createImageValidator(customRules);
      const buffer = createTestBuffer(1024);
      const filename = 'test.jpg';
      const mimeType = 'image/jpeg';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate with no restrictions', async () => {
      const customRules: ImageValidationRules = {};
      const validator = createImageValidator(customRules);
      const buffer = createTestBuffer(100 * 1024 * 1024); // Very large
      const filename = 'any-file.xyz';
      const mimeType = 'application/octet-stream';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty buffer', async () => {
      const validator = createImageValidator();
      const buffer = createTestBuffer(0);
      const filename = 'empty.jpg';
      const mimeType = 'image/jpeg';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(true);
    });

    it('should handle files at exact size limit', async () => {
      const maxSize = 1024;
      const customRules: ImageValidationRules = {
        ...DEFAULT_IMAGE_RULES,
        maxSize
      };
      const validator = createImageValidator(customRules);
      const buffer = createTestBuffer(maxSize);
      const filename = 'exact.jpg';
      const mimeType = 'image/jpeg';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle uppercase file extensions', async () => {
      const validator = createImageValidator();
      const buffer = createTestBuffer(1024);
      const filename = 'IMAGE.JPG';
      const mimeType = 'image/jpeg';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle files with multiple dots in name', async () => {
      const validator = createImageValidator();
      const buffer = createTestBuffer(1024);
      const filename = 'my.test.image.v2.jpg';
      const mimeType = 'image/jpeg';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle filename without extension', async () => {
      const validator = createImageValidator();
      const buffer = createTestBuffer(1024);
      const filename = 'image';
      const mimeType = 'image/jpeg';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.includes('extension'))).toBe(true);
    });
  });
});
