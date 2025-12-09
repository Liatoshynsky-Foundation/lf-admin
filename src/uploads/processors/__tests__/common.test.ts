import { createIdentityProcessor, FileProcessor, ProcessingResult } from '../common';

describe('createIdentityProcessor', () => {
  let processor: FileProcessor;

  beforeEach(() => {
    processor = createIdentityProcessor();
  });

  describe('process', () => {
    it('should return the original buffer unchanged', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.buffer).toBe(buffer);
      expect(result.buffer.toString()).toBe('test content');
    });

    it('should return success as true', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.success).toBe(true);
    });

    it('should include original filename in metadata', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test-file.txt';
      const mimeType = 'text/plain';

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.metadata.originalFilename).toBe(filename);
    });

    it('should include original mime type in metadata', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'application/pdf';

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.metadata.originalMimeType).toBe(mimeType);
    });

    it('should mark as not processed in metadata', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.metadata.processed).toBe(false);
    });

    it('should return empty errors array', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.errors).toEqual([]);
      expect(result.errors).toHaveLength(0);
    });

    it('should merge custom options into metadata', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';
      const customOptions = {
        customField1: 'value1',
        customField2: 42,
        customField3: true
      };

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType, customOptions);

      expect(result.metadata.customField1).toBe('value1');
      expect(result.metadata.customField2).toBe(42);
      expect(result.metadata.customField3).toBe(true);
    });

    it('should handle empty buffer', async () => {
      const buffer = Buffer.from('');
      const filename = 'empty.txt';
      const mimeType = 'text/plain';

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.success).toBe(true);
      expect(result.buffer).toBe(buffer);
      expect(result.buffer.length).toBe(0);
    });

    it('should handle large buffer', async () => {
      const largeContent = 'x'.repeat(10000);
      const buffer = Buffer.from(largeContent);
      const filename = 'large.txt';
      const mimeType = 'text/plain';

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.success).toBe(true);
      expect(result.buffer).toBe(buffer);
      expect(result.buffer.length).toBe(10000);
    });

    it('should work without optional options parameter', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.success).toBe(true);
      expect(result.metadata.originalFilename).toBe(filename);
      expect(result.metadata.originalMimeType).toBe(mimeType);
      expect(result.metadata.processed).toBe(false);
    });

    it('should handle various mime types', async () => {
      const buffer = Buffer.from('test');
      const mimeTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'video/mp4',
        'audio/mpeg',
        'application/octet-stream'
      ];

      for (const mimeType of mimeTypes) {
        const result = await processor.process(buffer, 'test.file', mimeType);
        expect(result.metadata.originalMimeType).toBe(mimeType);
        expect(result.success).toBe(true);
      }
    });

    it('should handle special characters in filename', async () => {
      const buffer = Buffer.from('test');
      const filename = 'test-file_v1.2(final)[copy].txt';
      const mimeType = 'text/plain';

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.metadata.originalFilename).toBe(filename);
      expect(result.success).toBe(true);
    });
  });
});
