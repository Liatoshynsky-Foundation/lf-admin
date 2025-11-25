import type { JSONContent } from '@tiptap/react';

import { getAllImages, getFirstImage, isContentEmpty, validateImageFile } from '../helpers/utils';

describe('Content Editor Utils', () => {
  describe('isContentEmpty', () => {
    it('should return true for null content', () => {
      expect(isContentEmpty(null)).toBe(true);
    });

    it('should return true for undefined content', () => {
      expect(isContentEmpty(undefined)).toBe(true);
    });

    it('should return true for empty content object', () => {
      const content: JSONContent = { type: 'doc', content: [] };
      expect(isContentEmpty(content)).toBe(true);
    });

    it('should return true for content with only empty paragraphs', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [{ type: 'paragraph' }, { type: 'paragraph', content: [] }]
      };
      expect(isContentEmpty(content)).toBe(true);
    });

    it('should return false for content with text', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello' }]
          }
        ]
      };
      expect(isContentEmpty(content)).toBe(false);
    });

    it('should return false for content with non-paragraph nodes', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title' }] }]
      };
      expect(isContentEmpty(content)).toBe(false);
    });

    it('should return false for content with images', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [{ type: 'image', attrs: { src: 'image.jpg' } }]
      };
      expect(isContentEmpty(content)).toBe(false);
    });

    it('should return false for content with lists', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item' }] }]
              }
            ]
          }
        ]
      };
      expect(isContentEmpty(content)).toBe(false);
    });
  });

  describe('getFirstImage', () => {
    it('should return null for null content', () => {
      expect(getFirstImage(null)).toBeNull();
    });

    it('should return null for undefined content', () => {
      expect(getFirstImage(undefined)).toBeNull();
    });

    it('should return null for content without images', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'No images here' }]
          }
        ]
      };
      expect(getFirstImage(content)).toBeNull();
    });

    it('should return the first image src', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Before image' }] },
          { type: 'image', attrs: { src: 'first-image.jpg' } },
          { type: 'image', attrs: { src: 'second-image.jpg' } }
        ]
      };
      expect(getFirstImage(content)).toBe('first-image.jpg');
    });

    it('should find image nested in other elements', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Text before' }]
          },
          {
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'image', attrs: { src: 'nested-image.jpg' } }]
              }
            ]
          }
        ]
      };
      expect(getFirstImage(content)).toBe('nested-image.jpg');
    });

    it('should return null when image has no src attribute', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [{ type: 'image', attrs: {} }]
      };
      expect(getFirstImage(content)).toBeNull();
    });

    it('should handle complex nested structures', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'image', attrs: { src: 'list-image.jpg' } }]
                  }
                ]
              }
            ]
          }
        ]
      };
      expect(getFirstImage(content)).toBe('list-image.jpg');
    });
  });

  describe('getAllImages', () => {
    it('should return empty array for null content', () => {
      expect(getAllImages(null)).toEqual([]);
    });

    it('should return empty array for undefined content', () => {
      expect(getAllImages(undefined)).toEqual([]);
    });

    it('should return empty array for content without images', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'No images' }] }]
      };
      expect(getAllImages(content)).toEqual([]);
    });

    it('should return all image sources', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          { type: 'image', attrs: { src: 'image1.jpg' } },
          { type: 'paragraph', content: [{ type: 'text', text: 'Text' }] },
          { type: 'image', attrs: { src: 'image2.jpg' } },
          { type: 'image', attrs: { src: 'image3.jpg' } }
        ]
      };
      expect(getAllImages(content)).toEqual(['image1.jpg', 'image2.jpg', 'image3.jpg']);
    });

    it('should find all images in nested structures', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'image', attrs: { src: 'nested1.jpg' } }]
              }
            ]
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'image', attrs: { src: 'nested2.jpg' } }]
                  }
                ]
              }
            ]
          }
        ]
      };
      expect(getAllImages(content)).toEqual(['nested1.jpg', 'nested2.jpg']);
    });

    it('should skip images without src attribute', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          { type: 'image', attrs: { src: 'valid.jpg' } },
          { type: 'image', attrs: {} },
          { type: 'image', attrs: { src: 'valid2.jpg' } }
        ]
      };
      expect(getAllImages(content)).toEqual(['valid.jpg', 'valid2.jpg']);
    });

    it('should maintain order of images', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          { type: 'image', attrs: { src: 'first.jpg' } },
          { type: 'image', attrs: { src: 'second.jpg' } },
          { type: 'image', attrs: { src: 'third.jpg' } }
        ]
      };
      expect(getAllImages(content)).toEqual(['first.jpg', 'second.jpg', 'third.jpg']);
    });
  });

  describe('validateImageFile', () => {
    const createMockFile = (name: string, type: string, size: number): File => {
      const file = new File([''], name, { type });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    it('should return error when file is not provided', () => {
      const result = validateImageFile(null as unknown as File);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('No file provided');
    });

    it('should validate jpeg files', () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1024);
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate jpg files', () => {
      const file = createMockFile('test.jpg', 'image/jpg', 1024);
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate png files', () => {
      const file = createMockFile('test.png', 'image/png', 1024);
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate gif files', () => {
      const file = createMockFile('test.gif', 'image/gif', 1024);
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate webp files', () => {
      const file = createMockFile('test.webp', 'image/webp', 1024);
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-image files', () => {
      const file = createMockFile('document.pdf', 'application/pdf', 1024);
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File type not allowed');
    });

    it('should reject files exceeding default max size (5MB)', () => {
      const file = createMockFile('large.jpg', 'image/jpeg', 6 * 1024 * 1024); // 6MB
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds 5.00MB');
    });

    it('should accept files within default max size', () => {
      const file = createMockFile('valid.jpg', 'image/jpeg', 3 * 1024 * 1024); // 3MB
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('should validate file exactly at max size', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const file = createMockFile('exact.jpg', 'image/jpeg', maxSize);
      const result = validateImageFile(file, { maxSize });
      expect(result.valid).toBe(true);
    });

    it('should reject file just over max size', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const file = createMockFile('over.jpg', 'image/jpeg', maxSize + 1);
      const result = validateImageFile(file, { maxSize });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds');
    });

    it('should handle very small files', () => {
      const file = createMockFile('tiny.jpg', 'image/jpeg', 100); // 100 bytes
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });
  });
});
