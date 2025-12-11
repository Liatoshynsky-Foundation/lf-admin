import { FileProcessor, ProcessingResult } from '../common';
import { createImageProcessor, ImageProcessingOptions } from '../imageProcessor';

const createTestFile = () => ({
  buffer: Buffer.from('fake image data'),
  filename: 'image.jpg',
  mimeType: 'image/jpeg'
});

describe('createImageProcessor', () => {
  let processor: FileProcessor;

  beforeEach(() => {
    processor = createImageProcessor();
  });

  describe('process', () => {
    it('should process image successfully', async () => {
      const { buffer, filename, mimeType } = createTestFile();

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.success).toBe(true);
    });

    it('should return buffer (placeholder implementation)', async () => {
      const { buffer, filename, mimeType } = createTestFile();

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.buffer).toBe(buffer);
    });

    it('should include original filename in metadata', async () => {
      const buffer = Buffer.from('fake image data');
      const filename = 'photo.png';
      const mimeType = 'image/png';

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.metadata.originalFilename).toBe(filename);
    });

    it('should include original mime type in metadata', async () => {
      const { buffer, filename, mimeType } = createTestFile();

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.metadata.originalMimeType).toBe(mimeType);
    });

    it('should mark as processed in metadata', async () => {
      const { buffer, filename, mimeType } = createTestFile();

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.metadata.processed).toBe(true);
    });

    it('should return empty errors array on success', async () => {
      const { buffer, filename, mimeType } = createTestFile();

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.errors).toEqual([]);
      expect(result.errors).toHaveLength(0);
    });

    it('should include processing options in metadata', async () => {
      const { buffer, filename, mimeType } = createTestFile();
      const options: ImageProcessingOptions = {
        resize: { width: 800, height: 600, fit: 'cover' },
        format: 'jpeg',
        quality: 80
      };

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType, options);

      expect(result.metadata.processingOptions).toEqual(options);
    });

    it('should merge default options with runtime options', async () => {
      const defaultOptions: ImageProcessingOptions = {
        quality: 90,
        optimize: true
      };
      const processorWithDefaults = createImageProcessor(defaultOptions);

      const { buffer, filename, mimeType } = createTestFile();
      const runtimeOptions: ImageProcessingOptions = {
        resize: { width: 500 }
      };

      const result: ProcessingResult = await processorWithDefaults.process(buffer, filename, mimeType, runtimeOptions);

      expect(result.metadata.processingOptions.quality).toBe(90);
      expect(result.metadata.processingOptions.optimize).toBe(true);
      expect(result.metadata.processingOptions.resize).toEqual({ width: 500 });
    });

    it('should override default options with runtime options', async () => {
      const defaultOptions: ImageProcessingOptions = {
        quality: 90,
        format: 'jpeg'
      };
      const processorWithDefaults = createImageProcessor(defaultOptions);

      const { buffer, filename, mimeType } = createTestFile();
      const runtimeOptions: ImageProcessingOptions = {
        quality: 50,
        format: 'webp'
      };

      const result: ProcessingResult = await processorWithDefaults.process(buffer, filename, mimeType, runtimeOptions);

      expect(result.metadata.processingOptions.quality).toBe(50);
      expect(result.metadata.processingOptions.format).toBe('webp');
    });

    it('should handle resize options with width only', async () => {
      const { buffer, filename, mimeType } = createTestFile();
      const options: ImageProcessingOptions = {
        resize: { width: 1000 }
      };

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType, options);

      expect(result.success).toBe(true);
      expect(result.metadata.processingOptions.resize?.width).toBe(1000);
    });

    it('should handle resize options with height only', async () => {
      const { buffer, filename, mimeType } = createTestFile();
      const options: ImageProcessingOptions = {
        resize: { height: 800 }
      };

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType, options);

      expect(result.success).toBe(true);
      expect(result.metadata.processingOptions.resize?.height).toBe(800);
    });

    it('should handle all fit options', async () => {
      const { buffer, filename, mimeType } = createTestFile();
      const fitOptions: Array<'cover' | 'contain' | 'fill' | 'inside' | 'outside'> = [
        'cover',
        'contain',
        'fill',
        'inside',
        'outside'
      ];

      for (const fit of fitOptions) {
        const options: ImageProcessingOptions = {
          resize: { width: 800, height: 600, fit }
        };

        const result = await processor.process(buffer, filename, mimeType, options);

        expect(result.success).toBe(true);
        expect(result.metadata.processingOptions.resize?.fit).toBe(fit);
      }
    });

    it('should handle all format options', async () => {
      const { buffer, filename, mimeType } = createTestFile();
      const formats: Array<'jpeg' | 'png' | 'webp' | 'gif'> = ['jpeg', 'png', 'webp', 'gif'];

      for (const format of formats) {
        const options: ImageProcessingOptions = { format };
        const result = await processor.process(buffer, filename, mimeType, options);

        expect(result.success).toBe(true);
        expect(result.metadata.processingOptions.format).toBe(format);
      }
    });

    it('should handle quality values', async () => {
      const { buffer, filename, mimeType } = createTestFile();
      const qualities = [1, 50, 100];

      for (const quality of qualities) {
        const options: ImageProcessingOptions = { quality };
        const result = await processor.process(buffer, filename, mimeType, options);

        expect(result.success).toBe(true);
        expect(result.metadata.processingOptions.quality).toBe(quality);
      }
    });

    it('should handle optimize option', async () => {
      const { buffer, filename, mimeType } = createTestFile();
      const options: ImageProcessingOptions = {
        optimize: true
      };

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType, options);

      expect(result.success).toBe(true);
      expect(result.metadata.processingOptions.optimize).toBe(true);
    });

    it('should work without any options', async () => {
      const { buffer, filename, mimeType } = createTestFile();

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.success).toBe(true);
      expect(result.metadata.processingOptions).toEqual({});
    });

    it('should handle empty buffer', async () => {
      const buffer = Buffer.from('');
      const filename = 'empty.jpg';
      const mimeType = 'image/jpeg';

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType);

      expect(result.success).toBe(true);
      expect(result.buffer.length).toBe(0);
    });

    it('should handle large buffer', async () => {
      const largeContent = Buffer.alloc(1024 * 1024); // 1MB
      const filename = 'large.jpg';
      const mimeType = 'image/jpeg';

      const result: ProcessingResult = await processor.process(largeContent, filename, mimeType);

      expect(result.success).toBe(true);
      expect(result.buffer.length).toBe(1024 * 1024);
    });

    it('should handle various image mime types', async () => {
      const { buffer } = createTestFile();
      const mimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

      for (const mimeType of mimeTypes) {
        const result = await processor.process(buffer, 'image.file', mimeType);
        expect(result.success).toBe(true);
        expect(result.metadata.originalMimeType).toBe(mimeType);
      }
    });

    it('should handle complex processing options combination', async () => {
      const { buffer, filename, mimeType } = createTestFile();
      const options: ImageProcessingOptions = {
        resize: {
          width: 1920,
          height: 1080,
          fit: 'cover'
        },
        format: 'webp',
        quality: 85,
        optimize: true
      };

      const result: ProcessingResult = await processor.process(buffer, filename, mimeType, options);

      expect(result.success).toBe(true);
      expect(result.metadata.processingOptions).toEqual(options);
      expect(result.metadata.processed).toBe(true);
    });
  });
});
