import {
  combineValidationResults,
  getFileExtension,
  validateExtension,
  validateFileSize,
  validateMimeType,
  ValidationResult
} from '../common';

describe('getFileExtension', () => {
  it('should extract file extension correctly', () => {
    expect(getFileExtension('image.jpg')).toBe('jpg');
    expect(getFileExtension('document.pdf')).toBe('pdf');
    expect(getFileExtension('archive.tar.gz')).toBe('gz');
  });

  it('should return lowercase extension', () => {
    expect(getFileExtension('IMAGE.JPG')).toBe('jpg');
    expect(getFileExtension('Document.PDF')).toBe('pdf');
  });

  it('should return empty string for files without extension', () => {
    expect(getFileExtension('README')).toBe('');
    expect(getFileExtension('makefile')).toBe('');
  });

  it('should handle files with dots in name', () => {
    expect(getFileExtension('my.file.name.txt')).toBe('txt');
    expect(getFileExtension('file.backup.2024.zip')).toBe('zip');
  });

  it('should handle edge cases', () => {
    expect(getFileExtension('')).toBe('');
    expect(getFileExtension('.')).toBe('');
    expect(getFileExtension('.hidden')).toBe('hidden');
  });
});

describe('validateFileSize', () => {
  it('should pass validation when file size is within limit', () => {
    const buffer = Buffer.alloc(1000);
    const result = validateFileSize(buffer, 2000);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should pass validation when file size equals the limit', () => {
    const buffer = Buffer.alloc(1000);
    const result = validateFileSize(buffer, 1000);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail validation when file size exceeds limit', () => {
    const buffer = Buffer.alloc(3000);
    const result = validateFileSize(buffer, 2000);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('File size 3000 bytes exceeds maximum allowed size 2000 bytes');
  });

  it('should pass validation when no max size is specified', () => {
    const buffer = Buffer.alloc(1000000);
    const result = validateFileSize(buffer);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle zero-sized files', () => {
    const buffer = Buffer.alloc(0);
    const result = validateFileSize(buffer, 1000);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateMimeType', () => {
  it('should pass validation when mime type is allowed', () => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    const result = validateMimeType('image/jpeg', allowedTypes);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail validation when mime type is not allowed', () => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    const result = validateMimeType('image/gif', allowedTypes);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('MIME type image/gif is not allowed');
    expect(result.errors[0]).toContain('image/jpeg, image/png');
  });

  it('should pass validation when no allowed types are specified', () => {
    const result = validateMimeType('application/octet-stream');

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should be case-sensitive for mime types', () => {
    const allowedTypes = ['image/jpeg'];
    const result = validateMimeType('IMAGE/JPEG', allowedTypes);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });

  it('should handle empty allowed types array', () => {
    const result = validateMimeType('image/jpeg', []);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });
});

describe('validateExtension', () => {
  it('should pass validation when extension is allowed', () => {
    const allowedExtensions = ['jpg', 'png', 'gif'];
    const result = validateExtension('image.jpg', allowedExtensions);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should be case-insensitive', () => {
    const allowedExtensions = ['jpg', 'png'];
    const result1 = validateExtension('image.JPG', allowedExtensions);
    const result2 = validateExtension('IMAGE.jpg', allowedExtensions);

    expect(result1.valid).toBe(true);
    expect(result2.valid).toBe(true);
  });

  it('should fail validation when extension is not allowed', () => {
    const allowedExtensions = ['jpg', 'png'];
    const result = validateExtension('document.pdf', allowedExtensions);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('File extension .pdf is not allowed');
    expect(result.errors[0]).toContain('jpg, png');
  });

  it('should pass validation when no allowed extensions are specified', () => {
    const result = validateExtension('any-file.xyz');

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle files without extension', () => {
    const allowedExtensions = ['txt'];
    const result = validateExtension('README', allowedExtensions);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('File extension . is not allowed');
  });

  it('should normalize allowed extensions to lowercase', () => {
    const allowedExtensions = ['JPG', 'PNG'];
    const result = validateExtension('image.jpg', allowedExtensions);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle empty allowed extensions array', () => {
    const result = validateExtension('file.txt', []);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });
});

describe('combineValidationResults', () => {
  it('should return valid when all results are valid', () => {
    const result1: ValidationResult = { valid: true, errors: [] };
    const result2: ValidationResult = { valid: true, errors: [] };
    const result3: ValidationResult = { valid: true, errors: [] };

    const combined = combineValidationResults(result1, result2, result3);

    expect(combined.valid).toBe(true);
    expect(combined.errors).toHaveLength(0);
  });

  it('should return invalid when any result is invalid', () => {
    const result1: ValidationResult = { valid: true, errors: [] };
    const result2: ValidationResult = { valid: false, errors: ['Error 1'] };
    const result3: ValidationResult = { valid: true, errors: [] };

    const combined = combineValidationResults(result1, result2, result3);

    expect(combined.valid).toBe(false);
    expect(combined.errors).toHaveLength(1);
    expect(combined.errors[0]).toBe('Error 1');
  });

  it('should combine all errors from multiple results', () => {
    const result1: ValidationResult = { valid: false, errors: ['Error 1'] };
    const result2: ValidationResult = { valid: false, errors: ['Error 2', 'Error 3'] };
    const result3: ValidationResult = { valid: false, errors: ['Error 4'] };

    const combined = combineValidationResults(result1, result2, result3);

    expect(combined.valid).toBe(false);
    expect(combined.errors).toHaveLength(4);
    expect(combined.errors).toEqual(['Error 1', 'Error 2', 'Error 3', 'Error 4']);
  });

  it('should handle empty results array', () => {
    const combined = combineValidationResults();

    expect(combined.valid).toBe(true);
    expect(combined.errors).toHaveLength(0);
  });

  it('should handle single result', () => {
    const result: ValidationResult = { valid: false, errors: ['Single error'] };
    const combined = combineValidationResults(result);

    expect(combined.valid).toBe(false);
    expect(combined.errors).toHaveLength(1);
    expect(combined.errors[0]).toBe('Single error');
  });

  it('should preserve error order', () => {
    const result1: ValidationResult = { valid: false, errors: ['First'] };
    const result2: ValidationResult = { valid: false, errors: ['Second'] };
    const result3: ValidationResult = { valid: false, errors: ['Third'] };

    const combined = combineValidationResults(result1, result2, result3);

    expect(combined.errors).toEqual(['First', 'Second', 'Third']);
  });
});
