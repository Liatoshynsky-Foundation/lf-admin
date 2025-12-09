import * as path from 'path';

import { StorageAdapter } from '../types';

const mockAccess = jest.fn();
const mockMkdir = jest.fn();
const mockWriteFile = jest.fn();
const mockReadFile = jest.fn();
const mockUnlink = jest.fn();

jest.mock('fs/promises', () => ({
  access: mockAccess,
  mkdir: mockMkdir,
  writeFile: mockWriteFile,
  readFile: mockReadFile,
  unlink: mockUnlink
}));

import { createLocalStorage, LocalStorageOptions } from '../localStorage';

describe('createLocalStorage', () => {
  let storage: StorageAdapter;
  const basePath = '/tmp/test-uploads';
  const baseUrl = 'http://localhost:3000/uploads';

  beforeEach(() => {
    jest.clearAllMocks();
    const options: LocalStorageOptions = {
      basePath,
      baseUrl
    };
    storage = createLocalStorage(options);
  });

  describe('store', () => {
    it('should store file successfully', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      mockAccess.mockRejectedValue(new Error('not exists'));
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await storage.store(buffer, filename, mimeType);

      expect(result.success).toBe(true);
      expect(result.metadata.filename).toBe(filename);
      expect(result.metadata.mimeType).toBe(mimeType);
      expect(result.metadata.size).toBe(buffer.length);
    });

    it('should not create directory if it exists', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      mockAccess.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      await storage.store(buffer, filename, mimeType);

      expect(mockMkdir).not.toHaveBeenCalled();
    });

    it('should include url in metadata when baseUrl is provided', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      mockAccess.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await storage.store(buffer, filename, mimeType);

      expect(result.metadata.url).toBe(`${baseUrl}/${filename}`);
    });

    it('should use filename as originalName if not provided', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      mockAccess.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await storage.store(buffer, filename, mimeType);

      expect(result.metadata.originalName).toBe(filename);
    });

    it('should use provided originalName in metadata', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'abc123.txt';
      const mimeType = 'text/plain';
      const originalName = 'my-document.txt';

      mockAccess.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await storage.store(buffer, filename, mimeType, { originalName });

      expect(result.metadata.originalName).toBe(originalName);
    });

    it('should include custom metadata', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';
      const customMetadata = {
        userId: '123',
        category: 'documents'
      };

      mockAccess.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await storage.store(buffer, filename, mimeType, customMetadata);

      expect(result.metadata.userId).toBe('123');
      expect(result.metadata.category).toBe('documents');
    });

    it('should include path in metadata', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';
      const expectedPath = path.join(basePath, filename);

      mockAccess.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await storage.store(buffer, filename, mimeType);

      expect(result.metadata.path).toBe(expectedPath);
    });
  });

  describe('retrieve', () => {
    it('should return null if file does not exist', async () => {
      const filename = 'nonexistent.txt';

      mockReadFile.mockRejectedValue(new Error('File not found'));

      const result = await storage.retrieve(filename);

      expect(result).toBeNull();
    });

    it('should handle read errors gracefully', async () => {
      const filename = 'error.txt';

      mockReadFile.mockRejectedValue(new Error('Permission denied'));

      const result = await storage.retrieve(filename);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return error if file does not exist', async () => {
      const filename = 'nonexistent.txt';

      mockUnlink.mockRejectedValue(new Error('File not found'));

      const result = await storage.delete(filename);

      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found or could not be deleted');
    });
  });

  describe('exists', () => {
    it('should return false if file does not exist', async () => {
      const filename = 'nonexistent.txt';

      mockAccess.mockRejectedValue(new Error('File not found'));

      const result = await storage.exists(filename);

      expect(result).toBe(false);
    });
  });

  describe('getUrl', () => {
    it('should return correct URL with baseUrl', () => {
      const filename = 'test.txt';

      const result = storage.getUrl(filename);

      expect(result).toBe(`${baseUrl}/${filename}`);
    });

    it('should return null when baseUrl is not provided', () => {
      const storageWithoutUrl = createLocalStorage({ basePath });
      const filename = 'test.txt';

      const result = storageWithoutUrl.getUrl(filename);

      expect(result).toBeNull();
    });

    it('should handle filenames with paths', () => {
      const filename = 'folder/subfolder/test.txt';

      const result = storage.getUrl(filename);

      expect(result).toBe(`${baseUrl}/${filename}`);
    });
  });

  describe('integration scenarios', () => {
    it('should store and retrieve same file', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      mockAccess.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(buffer);

      await storage.store(buffer, filename, mimeType);
      const retrieved = await storage.retrieve(filename);

      expect(retrieved).toEqual(buffer);
    });

    it('should store, check existence, and delete', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      mockAccess.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);
      mockUnlink.mockResolvedValue(undefined);

      await storage.store(buffer, filename, mimeType);

      const existsBefore = await storage.exists(filename);
      expect(existsBefore).toBe(true);

      await storage.delete(filename);
    });
  });
});
