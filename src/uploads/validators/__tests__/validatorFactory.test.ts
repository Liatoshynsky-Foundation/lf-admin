import { ImageValidationRules } from '../imageValidator';
import { createValidator, FileType, ValidatorConfig } from '../validatorFactory';

describe('createValidator', () => {
  describe('image validator', () => {
    it('should create an image validator with default rules', async () => {
      const config: ValidatorConfig = {
        fileType: 'image'
      };

      const validator = createValidator(config);
      const buffer = Buffer.alloc(1024);
      const filename = 'test.jpg';
      const mimeType = 'image/jpeg';

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should create an image validator with custom rules', async () => {
      const customRules: ImageValidationRules = {
        maxSize: 500,
        allowedMimeTypes: ['image/png'],
        allowedExtensions: ['png']
      };

      const config: ValidatorConfig = {
        fileType: 'image',
        rules: customRules
      };

      const validator = createValidator(config);
      const buffer = Buffer.alloc(1024); // Too large
      const filename = 'test.jpg'; // Wrong extension
      const mimeType = 'image/jpeg'; // Wrong mime type

      const result = await validator.validate(buffer, filename, mimeType);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate multiple files with the same validator', async () => {
      const config: ValidatorConfig = {
        fileType: 'image'
      };

      const validator = createValidator(config);

      // First file
      const result1 = await validator.validate(Buffer.alloc(1024), 'image1.jpg', 'image/jpeg');
      expect(result1.valid).toBe(true);

      // Second file
      const result2 = await validator.validate(Buffer.alloc(2048), 'image2.png', 'image/png');
      expect(result2.valid).toBe(true);

      // Invalid file
      const result3 = await validator.validate(Buffer.alloc(1024), 'doc.pdf', 'application/pdf');
      expect(result3.valid).toBe(false);
    });
  });

  describe('unsupported file types', () => {
    it('should throw error for document validator', () => {
      const config: ValidatorConfig = {
        fileType: 'document'
      };

      expect(() => createValidator(config)).toThrow('Document validator not yet implemented');
    });

    it('should throw error for video validator', () => {
      const config: ValidatorConfig = {
        fileType: 'video'
      };

      expect(() => createValidator(config)).toThrow('Video validator not yet implemented');
    });

    it('should throw error for audio validator', () => {
      const config: ValidatorConfig = {
        fileType: 'audio'
      };

      expect(() => createValidator(config)).toThrow('Audio validator not yet implemented');
    });

    it('should throw error for generic validator', () => {
      const config: ValidatorConfig = {
        fileType: 'generic'
      };

      expect(() => createValidator(config)).toThrow('Generic validator not yet implemented');
    });
  });

  describe('invalid file types', () => {
    it('should throw error for unknown file type', () => {
      const config = {
        fileType: 'unknown-type' as FileType
      };

      expect(() => createValidator(config)).toThrow('Unknown file type: unknown-type');
    });

    it('should throw error for null file type', () => {
      const config = {
        fileType: null
      } as unknown as ValidatorConfig;

      expect(() => createValidator(config)).toThrow();
    });

    it('should throw error for undefined file type', () => {
      const config = {
        fileType: undefined
      } as unknown as ValidatorConfig;

      expect(() => createValidator(config)).toThrow();
    });
  });

  describe('validator reusability', () => {
    it('should allow creating multiple validators with different configs', () => {
      const config1: ValidatorConfig = {
        fileType: 'image',
        rules: { maxSize: 1024 }
      };

      const config2: ValidatorConfig = {
        fileType: 'image',
        rules: { maxSize: 2048 }
      };

      const validator1 = createValidator(config1);
      const validator2 = createValidator(config2);

      expect(validator1).not.toBe(validator2);
    });

    it('should create independent validator instances', async () => {
      const config: ValidatorConfig = {
        fileType: 'image'
      };

      const validator1 = createValidator(config);
      const validator2 = createValidator(config);

      const buffer = Buffer.alloc(1024);
      const filename = 'test.jpg';
      const mimeType = 'image/jpeg';

      const result1 = await validator1.validate(buffer, filename, mimeType);
      const result2 = await validator2.validate(buffer, filename, mimeType);

      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });
  });

  describe('type checking', () => {
    it('should accept valid FileType values', () => {
      const fileTypes: FileType[] = ['image', 'document', 'video', 'audio', 'generic'];

      // Only 'image' should work, others should throw
      expect(() => createValidator({ fileType: fileTypes[0] })).not.toThrow();
      expect(() => createValidator({ fileType: fileTypes[1] })).toThrow();
      expect(() => createValidator({ fileType: fileTypes[2] })).toThrow();
      expect(() => createValidator({ fileType: fileTypes[3] })).toThrow();
      expect(() => createValidator({ fileType: fileTypes[4] })).toThrow();
    });
  });
});
