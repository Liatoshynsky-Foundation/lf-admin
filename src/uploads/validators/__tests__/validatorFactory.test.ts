import { UPLOAD_ERRORS } from '../../errors';
import { createValidator, FileType, ValidatorConfig } from '../validatorFactory';

describe('createValidator', () => {
  describe('factory types', () => {
    const supportedTypes: FileType[] = ['image', 'document', 'pdf', 'spreadsheet', 'archive', 'audio', 'video'];

    supportedTypes.forEach((type) => {
      it(`should create validator for ${type}`, () => {
        expect(() => createValidator({ fileType: type })).not.toThrow();
      });
    });

    it('should throw for unknown type', () => {
      expect(() => createValidator({ fileType: 'generic' as FileType })).toThrow(UPLOAD_ERRORS.UNKNOWN_FILE_TYPE);
    });
  });

  describe('base validator rules', () => {
    it('should fail on empty buffer', async () => {
      const validator = createValidator({ fileType: 'document' });
      const result = await validator.validate(Buffer.alloc(0), 'test.pdf', 'application/pdf');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toBe('Файл не може бути порожнім (0 байт)');
    });

    it('should fail on too long filename', async () => {
      const longName = 'a'.repeat(256) + '.pdf';
      const validator = createValidator({ fileType: 'document' });
      const result = await validator.validate(Buffer.alloc(10), longName, 'application/pdf');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toBe('Ім\'я файлу занадто довге (максимум 255 символів)');
    });
  });

  describe('size limits and extra validations', () => {
    it('should validate document size limit (10MB)', async () => {
      const validator = createValidator({ fileType: 'document' });
      const bigBuffer = Buffer.alloc(11 * 1024 * 1024);
      const result = await validator.validate(bigBuffer, 'doc.txt', 'text/plain');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toBe('Розмір документа не може перевищувати 10MB');
    });

    it('should cap effective max size at default limit even if rules.maxSize is larger', async () => {
      const validator = createValidator({
        fileType: 'document',
        rules: { maxSize: 20 * 1024 * 1024 }
      });
      const buffer = Buffer.alloc(11 * 1024 * 1024);
      const result = await validator.validate(buffer, 'doc.txt', 'text/plain');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toBe('Розмір документа не може перевищувати 10MB');
    });

    it('should validate archive size limit (50MB)', async () => {
      const validator = createValidator({ fileType: 'archive' });
      const bigBuffer = Buffer.alloc(51 * 1024 * 1024);
      const result = await validator.validate(bigBuffer, 'archive.zip', 'application/zip');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Архів занадто великий');
    });

    it('should validate audio size limit (12MB)', async () => {
      const validator = createValidator({ fileType: 'audio' });
      const bigBuffer = Buffer.alloc(13 * 1024 * 1024);
      const result = await validator.validate(bigBuffer, 'audio.mp3', 'audio/mpeg');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Аудіофайл завеликий');
    });

    it('should validate video size limit (100MB)', async () => {
      const validator = createValidator({ fileType: 'video' });
      const bigBuffer = Buffer.alloc(101 * 1024 * 1024);
      const result = await validator.validate(bigBuffer, 'video.mp4', 'video/mp4');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Відеофайл перевищує ліміт');
    });

    it('should respect custom rules for maxSize if smaller than default', async () => {
      const validator = createValidator({
        fileType: 'document',
        rules: { maxSize: 1 * 1024 * 1024 }
      });
      const buffer = Buffer.alloc(2 * 1024 * 1024);
      const result = await validator.validate(buffer, 'test.pdf', 'application/pdf');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('exceeds maximum allowed size');
    });
  });

  describe('document PDF specific logic', () => {
    it('should pass valid PDF', async () => {
      const validator = createValidator({ fileType: 'document' });
      const pdfBuffer = Buffer.from('%PDF-1.4');
      const result = await validator.validate(pdfBuffer, 'test.pdf', 'application/pdf');
      expect(result.valid).toBe(true);
    });

    it('should validate PDF header when filename ends with .pdf even if mimeType is octet-stream', async () => {
      const validator = createValidator({ fileType: 'document' });
      const pdfBuffer = Buffer.from('%PDF-1.4');
      const result = await validator.validate(pdfBuffer, 'file.pdf', 'application/octet-stream');
      expect(result.valid).toBe(true);
    });

    it('should fail invalid PDF', async () => {
      const validator = createValidator({ fileType: 'document' });
      const badBuffer = Buffer.from('NOT_A_PDF');
      const result = await validator.validate(badBuffer, 'test.pdf', 'application/pdf');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toBe('Пошкоджений або підроблений PDF-файл');
    });

    it('should pass document validation for non-pdf if extension is not pdf', async () => {
      const validator = createValidator({ fileType: 'document' });
      const buffer = Buffer.from('data');
      const result = await validator.validate(buffer, 'test.doc', 'application/msword');
      expect(result.valid).toBe(true);
    });
  });

  describe('reusability', () => {
    it('should create independent validator instances', async () => {
      const config: ValidatorConfig = { fileType: 'image' };
      const v1 = createValidator(config);
      const v2 = createValidator(config);
      expect(v1).not.toBe(v2);
    });
  });
  it('should pass valid audio file when within size limit', async () => {
    const validator = createValidator({ fileType: 'audio' });
    const buffer = Buffer.alloc(1024);
    const result = await validator.validate(buffer, 'audio.mp3', 'audio/mpeg');

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
