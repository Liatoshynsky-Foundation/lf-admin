import { FileProcessor } from '../common';
import { ImageProcessingOptions } from '../imageProcessor';
import { createProcessor, ProcessorConfig } from '../processorFactory';

describe('createProcessor', () => {
  describe('image processor', () => {
    it('should create image processor with type "image"', () => {
      const config: ProcessorConfig = {
        type: 'image'
      };

      const processor: FileProcessor = createProcessor(config);

      expect(processor).toBeDefined();
      expect(processor.process).toBeDefined();
      expect(typeof processor.process).toBe('function');
    });

    it('should create image processor with options', () => {
      const options: ImageProcessingOptions = {
        resize: { width: 800, height: 600 },
        quality: 80
      };
      const config: ProcessorConfig = {
        type: 'image',
        options
      };

      const processor: FileProcessor = createProcessor(config);

      expect(processor).toBeDefined();
      expect(processor.process).toBeDefined();
    });

    it('should process image with returned processor', async () => {
      const config: ProcessorConfig = {
        type: 'image',
        options: { quality: 90 }
      };

      const processor: FileProcessor = createProcessor(config);
      const buffer = Buffer.from('fake image data');
      const result = await processor.process(buffer, 'test.jpg', 'image/jpeg');

      expect(result.success).toBe(true);
      expect(result.metadata.processed).toBe(true);
    });
  });

  describe('identity processor (none)', () => {
    it('should create identity processor with type "none"', () => {
      const config: ProcessorConfig = {
        type: 'none'
      };

      const processor: FileProcessor = createProcessor(config);

      expect(processor).toBeDefined();
      expect(processor.process).toBeDefined();
      expect(typeof processor.process).toBe('function');
    });

    it('should process file without modifications', async () => {
      const config: ProcessorConfig = {
        type: 'none'
      };

      const processor: FileProcessor = createProcessor(config);
      const buffer = Buffer.from('test content');
      const result = await processor.process(buffer, 'test.txt', 'text/plain');

      expect(result.success).toBe(true);
      expect(result.buffer).toBe(buffer);
      expect(result.metadata.processed).toBe(false);
    });
  });

  describe('default processor', () => {
    it('should create identity processor for unknown type', () => {
      const config: ProcessorConfig = {
        type: 'unknown' as any
      };

      const processor: FileProcessor = createProcessor(config);

      expect(processor).toBeDefined();
      expect(processor.process).toBeDefined();
    });

    it('should process file with identity processor for unknown type', async () => {
      const config: ProcessorConfig = {
        type: 'unknown' as any
      };

      const processor: FileProcessor = createProcessor(config);
      const buffer = Buffer.from('test content');
      const result = await processor.process(buffer, 'test.file', 'application/octet-stream');

      expect(result.success).toBe(true);
      expect(result.buffer).toBe(buffer);
      expect(result.metadata.processed).toBe(false);
    });
  });

  describe('unimplemented processors', () => {
    it('should throw error for document processor', () => {
      const config: ProcessorConfig = {
        type: 'document'
      };

      expect(() => createProcessor(config)).toThrow('Document processor not yet implemented');
    });

    it('should throw error for video processor', () => {
      const config: ProcessorConfig = {
        type: 'video'
      };

      expect(() => createProcessor(config)).toThrow('Video processor not yet implemented');
    });

    it('should throw error for audio processor', () => {
      const config: ProcessorConfig = {
        type: 'audio'
      };

      expect(() => createProcessor(config)).toThrow('Audio processor not yet implemented');
    });

    it('should throw error for document processor with options', () => {
      const config: ProcessorConfig = {
        type: 'document',
        options: { compress: true }
      };

      expect(() => createProcessor(config)).toThrow('Document processor not yet implemented');
    });

    it('should throw error for video processor with options', () => {
      const config: ProcessorConfig = {
        type: 'video',
        options: { codec: 'h264' }
      };

      expect(() => createProcessor(config)).toThrow('Video processor not yet implemented');
    });

    it('should throw error for audio processor with options', () => {
      const config: ProcessorConfig = {
        type: 'audio',
        options: { bitrate: 128 }
      };

      expect(() => createProcessor(config)).toThrow('Audio processor not yet implemented');
    });
  });

  describe('processor type validation', () => {
    it('should handle all valid processor types', () => {
      const validTypes: ProcessorConfig['type'][] = ['image', 'none'];

      validTypes.forEach((type) => {
        const config: ProcessorConfig = { type };
        const processor = createProcessor(config);
        expect(processor).toBeDefined();
        expect(processor.process).toBeDefined();
      });
    });

    it('should handle processor creation with empty options', () => {
      const config: ProcessorConfig = {
        type: 'image',
        options: {}
      };

      const processor: FileProcessor = createProcessor(config);
      expect(processor).toBeDefined();
    });

    it('should handle processor creation without options property', () => {
      const config: ProcessorConfig = {
        type: 'image'
      };

      const processor: FileProcessor = createProcessor(config);
      expect(processor).toBeDefined();
    });
  });

  describe('integration scenarios', () => {
    it('should create different processors for different types', async () => {
      const imageConfig: ProcessorConfig = { type: 'image' };
      const noneConfig: ProcessorConfig = { type: 'none' };

      const imageProcessor = createProcessor(imageConfig);
      const noneProcessor = createProcessor(noneConfig);

      const buffer = Buffer.from('test');

      const imageResult = await imageProcessor.process(buffer, 'test.jpg', 'image/jpeg');
      const noneResult = await noneProcessor.process(buffer, 'test.txt', 'text/plain');

      expect(imageResult.metadata.processed).toBe(true);
      expect(noneResult.metadata.processed).toBe(false);
    });

    it('should pass options correctly to image processor', async () => {
      const options: ImageProcessingOptions = {
        resize: { width: 500, height: 500, fit: 'cover' },
        format: 'webp',
        quality: 75,
        optimize: true
      };
      const config: ProcessorConfig = {
        type: 'image',
        options
      };

      const processor = createProcessor(config);
      const buffer = Buffer.from('fake image');
      const result = await processor.process(buffer, 'test.jpg', 'image/jpeg');

      expect(result.metadata.processingOptions).toEqual(options);
    });

    it('should allow runtime options to override default options', async () => {
      const defaultOptions: ImageProcessingOptions = {
        quality: 80,
        format: 'jpeg'
      };
      const config: ProcessorConfig = {
        type: 'image',
        options: defaultOptions
      };

      const processor = createProcessor(config);
      const buffer = Buffer.from('fake image');
      const runtimeOptions = {
        quality: 95,
        format: 'png'
      };
      const result = await processor.process(buffer, 'test.jpg', 'image/jpeg', runtimeOptions);

      expect(result.metadata.processingOptions.quality).toBe(95);
      expect(result.metadata.processingOptions.format).toBe('png');
    });

    it('should create multiple independent processors', () => {
      const processor1 = createProcessor({ type: 'image', options: { quality: 80 } });
      const processor2 = createProcessor({ type: 'image', options: { quality: 90 } });
      const processor3 = createProcessor({ type: 'none' });

      expect(processor1).toBeDefined();
      expect(processor2).toBeDefined();
      expect(processor3).toBeDefined();
    });
  });
});
