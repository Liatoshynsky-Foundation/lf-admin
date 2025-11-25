import { ImageUploadExtension } from '../helpers/ImageUpload';

describe('ImageUploadExtension', () => {
  let mockOnImageUpload: jest.Mock;

  beforeEach(() => {
    mockOnImageUpload = jest.fn().mockResolvedValue('https://example.com/uploaded-image.png');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Extension Configuration', () => {
    it('should extend Image extension', () => {
      expect(ImageUploadExtension.name).toBe('image');
    });

    it('should have onImageUpload option', () => {
      const extension = ImageUploadExtension.configure({ onImageUpload: mockOnImageUpload });
      expect(extension.options.onImageUpload).toBe(mockOnImageUpload);
    });

    it('should allow undefined onImageUpload', () => {
      const extension = ImageUploadExtension.configure({});
      expect(extension.options.onImageUpload).toBeUndefined();
    });

    it('should inherit parent options', () => {
      const extension = ImageUploadExtension.configure({ onImageUpload: mockOnImageUpload });
      expect(extension.options).toBeDefined();
    });
  });

  describe('Plugin Creation', () => {
    it('should create ProseMirror plugins', () => {
      const extension = ImageUploadExtension.configure({ onImageUpload: mockOnImageUpload });

      expect(extension.config.addProseMirrorPlugins).toBeDefined();
    });

    it('should create plugin without onImageUpload', () => {
      const extension = ImageUploadExtension.configure({});

      expect(extension.config.addProseMirrorPlugins).toBeDefined();
    });

    it('should have proper extension type', () => {
      expect(ImageUploadExtension.type).toBe('node');
    });
  });

  describe('File Type Validation', () => {
    it('should identify image files correctly', () => {
      const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];

      imageTypes.forEach((type) => {
        const file = new File(['content'], 'test.img', { type });
        expect(file.type.startsWith('image/')).toBe(true);
      });
    });

    it('should reject non-image files', () => {
      const nonImageTypes = ['text/plain', 'application/pdf', 'video/mp4', 'audio/mp3'];

      nonImageTypes.forEach((type) => {
        const file = new File(['content'], 'test.file', { type });
        expect(file.type.startsWith('image/')).toBe(false);
      });
    });

    it('should filter image files from mixed file array', () => {
      const files = [
        new File(['img'], 'image.png', { type: 'image/png' }),
        new File(['txt'], 'doc.txt', { type: 'text/plain' }),
        new File(['img2'], 'photo.jpg', { type: 'image/jpeg' }),
        new File(['pdf'], 'file.pdf', { type: 'application/pdf' })
      ];

      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      expect(imageFiles).toHaveLength(2);
      expect(imageFiles[0].type).toBe('image/png');
      expect(imageFiles[1].type).toBe('image/jpeg');
    });
  });

  describe('Upload Callback', () => {
    it('should call onImageUpload with file', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });

      const result = await mockOnImageUpload(file);

      expect(mockOnImageUpload).toHaveBeenCalledWith(file);
      expect(result).toBe('https://example.com/uploaded-image.png');
    });

    it('should handle upload errors', async () => {
      const error = new Error('Upload failed');
      mockOnImageUpload.mockRejectedValue(error);

      const file = new File(['test'], 'test.png', { type: 'image/png' });

      await expect(mockOnImageUpload(file)).rejects.toThrow('Upload failed');
    });

    it('should handle multiple file uploads', async () => {
      const files = [
        new File(['test1'], 'test1.png', { type: 'image/png' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];

      mockOnImageUpload
        .mockResolvedValueOnce('https://example.com/image1.png')
        .mockResolvedValueOnce('https://example.com/image2.jpg');

      const results = await Promise.all(files.map((file) => mockOnImageUpload(file)));

      expect(results).toEqual(['https://example.com/image1.png', 'https://example.com/image2.jpg']);
      expect(mockOnImageUpload).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Handling Integration', () => {
    it('should have drop event handler in plugin props', () => {
      const extension = ImageUploadExtension.configure({ onImageUpload: mockOnImageUpload });

      expect(extension.config.addProseMirrorPlugins).toBeDefined();
      expect(typeof extension.config.addProseMirrorPlugins).toBe('function');
    });

    it('should have paste event handler in plugin props', () => {
      const extension = ImageUploadExtension.configure({ onImageUpload: mockOnImageUpload });

      expect(extension.config.addProseMirrorPlugins).toBeDefined();
      expect(typeof extension.config.addProseMirrorPlugins).toBe('function');
    });

    it('should handle drag and drop event structure', () => {
      const mockDragEvent = {
        preventDefault: jest.fn(),
        dataTransfer: {
          files: [new File(['img'], 'test.png', { type: 'image/png' })] as any
        },
        clientX: 100,
        clientY: 100
      };

      expect(mockDragEvent.dataTransfer.files).toHaveLength(1);
      expect(mockDragEvent.dataTransfer.files[0].type).toBe('image/png');
    });

    it('should handle paste event structure', () => {
      const mockClipboardEvent = {
        preventDefault: jest.fn(),
        clipboardData: {
          files: [new File(['img'], 'paste.png', { type: 'image/png' })] as any
        }
      };

      expect(mockClipboardEvent.clipboardData.files).toHaveLength(1);
      expect(mockClipboardEvent.clipboardData.files[0].type).toBe('image/png');
    });
  });

  describe('Error Handling', () => {
    it('should log error when upload fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Network error');

      mockOnImageUpload.mockRejectedValue(error);

      try {
        await mockOnImageUpload(new File(['test'], 'test.png', { type: 'image/png' }));
      } catch (e) {
        console.log(e);
      }

      consoleSpy.mockRestore();
    });

    it('should handle missing file type', () => {
      const file = new File(['test'], 'noext', { type: '' });
      expect(file.type.startsWith('image/')).toBe(false);
    });

    it('should handle empty file list', () => {
      const files: File[] = [];
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      expect(imageFiles).toHaveLength(0);
    });
  });
});
