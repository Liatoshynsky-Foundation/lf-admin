import 'whatwg-fetch';
import { BlobServiceClient, BlockBlobClient, ContainerClient } from '@azure/storage-blob';

import { UPLOAD_ERRORS } from '../../errors';
import { AzureBlobStorageAdapter, createAzureBlobStorage } from '../azureBlobStorage';

// Mock dependencies
jest.mock('@azure/storage-blob');
jest.mock('~/src/middleware/logger/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn()
  }
}));
jest.mock('../../../validators/blob.schema', () => ({
  zFolderNameSchema: {
    parse: jest.fn((val: string) => val)
  },
  zContentTypeSchema: {
    parse: jest.fn((val: string) => val)
  }
}));

describe('createAzureBlobStorage', () => {
  let storage: AzureBlobStorageAdapter;
  let mockBlobServiceClient: jest.Mocked<BlobServiceClient>;
  let mockContainerClient: jest.Mocked<ContainerClient>;
  let mockBlockBlobClient: jest.Mocked<BlockBlobClient>;

  const containerName = 'test-container';
  const baseUrl = 'https://test.blob.core.windows.net';
  const folderPrefix = 'tmp';
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup environment
    process.env = {
      ...originalEnv,
      AZURE_SAS_URL: 'https://test.blob.core.windows.net?sas=token'
    } as any;

    // Setup mocks
    mockBlockBlobClient = {
      uploadData: jest.fn().mockResolvedValue({}),
      deleteIfExists: jest.fn().mockResolvedValue({ succeeded: true }),
      exists: jest.fn().mockResolvedValue(true),
      url: 'https://test.blob.core.windows.net/test-container/uploads/testfile.txt',
      beginCopyFromURL: jest.fn(),
      name: 'testfile.txt'
    } as unknown as jest.Mocked<BlockBlobClient>;

    mockContainerClient = {
      getBlockBlobClient: jest.fn().mockReturnValue(mockBlockBlobClient),
      listBlobsFlat: jest.fn()
    } as unknown as jest.Mocked<ContainerClient>;

    mockBlobServiceClient = {
      getContainerClient: jest.fn().mockReturnValue(mockContainerClient)
    } as unknown as jest.Mocked<BlobServiceClient>;

    (BlobServiceClient as unknown as jest.Mock).mockReturnValue(mockBlobServiceClient);

    storage = createAzureBlobStorage({
      containerName,
      baseUrl,
      folderPrefix
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('initialization', () => {
    it('should throw error if AZURE_SAS_URL is not defined', async () => {
      process.env.AZURE_SAS_URL = undefined as unknown as string;

      const newStorage = createAzureBlobStorage();
      const buffer = Buffer.from('test');

      const result = await newStorage.store(buffer, 'test.txt', 'text/plain');

      expect(result.success).toBe(false);
      expect(result.error).toContain(UPLOAD_ERRORS.AZURE_URL_NOT_DEFINED);
    });

    it('should create BlobServiceClient with AZURE_SAS_URL', async () => {
      const newStorage = createAzureBlobStorage();
      const buffer = Buffer.from('test');

      await newStorage.store(buffer, 'test.txt', 'text/plain');

      expect(BlobServiceClient).toHaveBeenCalledWith(process.env.AZURE_SAS_URL);
    });
  });

  describe('store', () => {
    it('should store file successfully', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      const result = await storage.store(buffer, filename, mimeType);

      expect(result.success).toBe(true);
      expect(result.metadata.filename).toBe(filename);
      expect(result.metadata.mimeType).toBe(mimeType);
      expect(result.metadata.size).toBe(buffer.length);
      expect(mockBlockBlobClient.uploadData).toHaveBeenCalledWith(buffer, {
        blobHTTPHeaders: { blobContentType: mimeType }
      });
    });

    it('should include custom metadata in storage result', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';
      const metadata = { originalName: 'my-file.txt', custom: 'data' };

      const result = await storage.store(buffer, filename, mimeType, metadata);

      expect(result.success).toBe(true);
      expect(result.metadata.originalName).toBe('my-file.txt');
      expect((result.metadata as Record<string, unknown>).custom).toBe('data');
    });

    it('should construct correct URL when baseUrl is provided', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      const result = await storage.store(buffer, filename, mimeType);

      expect(result.metadata.url).toBe(`${baseUrl}/${filename}`);
    });

    it('should return error on upload failure', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';
      const error = new Error('Upload failed');

      mockBlockBlobClient.uploadData.mockRejectedValue(error);

      const result = await storage.store(buffer, filename, mimeType);

      expect(result.success).toBe(false);
      expect(result.error).toBe(error.message);
    });

    it('should return UNKNOWN_ERROR_OCCURRED for non-Error exceptions', async () => {
      const buffer = Buffer.from('test content');
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      mockBlockBlobClient.uploadData.mockRejectedValue('string error');

      const result = await storage.store(buffer, filename, mimeType);

      expect(result.success).toBe(false);
      expect(result.error).toBe(UPLOAD_ERRORS.UNKNOWN_ERROR_OCCURRED);
    });
  });

  describe('retrieve', () => {
    it('should retrieve file successfully', async () => {
      const filename = 'test.txt';
      const fileContent = 'test content';

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        body: Buffer.from(fileContent),
        headers: new Map([['Content-Type', 'text/plain']]),
        arrayBuffer: jest.fn().mockResolvedValue(Buffer.from(fileContent))
      });

      const result = await storage.retrieve(filename);

      expect(result).not.toBeNull();
      expect(result?.toString()).toBe(fileContent);
    });

    it('should return null if file not found', async () => {
      const filename = 'nonexistent.txt';

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        body: null,
        headers: new Map()
      });

      const result = await storage.retrieve(filename);

      expect(result).toBeNull();
    });

    it('should return null on fetch error', async () => {
      const filename = 'test.txt';

      globalThis.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

      const result = await storage.retrieve(filename);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete file successfully', async () => {
      const filename = 'test.txt';

      const result = await storage.delete(filename);

      expect(result.success).toBe(true);
      expect(mockBlockBlobClient.deleteIfExists).toHaveBeenCalled();
    });

    it('should return error on delete failure', async () => {
      const filename = 'test.txt';
      const error = new Error('Delete failed');

      mockBlockBlobClient.deleteIfExists.mockRejectedValue(error);

      const result = await storage.delete(filename);

      expect(result.success).toBe(false);
      expect(result.error).toBe(error.message);
    });

    it('should return UNKNOWN_ERROR_OCCURRED for non-Error exceptions', async () => {
      const filename = 'test.txt';

      mockBlockBlobClient.deleteIfExists.mockRejectedValue('string error');

      const result = await storage.delete(filename);

      expect(result.success).toBe(false);
      expect(result.error).toBe(UPLOAD_ERRORS.UNKNOWN_ERROR_OCCURRED);
    });
  });

  describe('exists', () => {
    it('should return true if file exists', async () => {
      const filename = 'test.txt';

      const result = await storage.exists(filename);

      expect(result).toBe(true);
      expect(mockBlockBlobClient.exists).toHaveBeenCalled();
    });

    it('should return false if file does not exist', async () => {
      const filename = 'nonexistent.txt';

      mockBlockBlobClient.exists.mockResolvedValue(false);

      const result = await storage.exists(filename);

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const filename = 'test.txt';

      mockBlockBlobClient.exists.mockRejectedValue(new Error('Check failed'));

      const result = await storage.exists(filename);

      expect(result).toBe(false);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for existing file', async () => {
      const filename = 'test.txt';
      const contentType = 'text/plain';
      const contentLength = '12';

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: jest.fn((key: string) => {
            if (key === 'Content-Type') return contentType;
            if (key === 'Content-Length') return contentLength;
            return null;
          })
        }
      });

      const result = await storage.getMetadata(filename);

      expect(result).not.toBeNull();
      expect(result?.filename).toBe(filename);
      expect(result?.mimeType).toBe(contentType);
      expect(result?.size).toBe(Number.parseInt(contentLength, 10));
    });

    it('should return null if file not found', async () => {
      const filename = 'nonexistent.txt';

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false
      });

      const result = await storage.getMetadata(filename);

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      const filename = 'test.txt';

      globalThis.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

      const result = await storage.getMetadata(filename);

      expect(result).toBeNull();
    });

    it('should use default content type if not provided', async () => {
      const filename = 'test.txt';

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: jest.fn(() => null)
        }
      });

      const result = await storage.getMetadata(filename);

      expect(result?.mimeType).toBe('application/octet-stream');
    });
  });

  describe('getUrl', () => {
    it('should return URL for file', () => {
      const filename = 'test.txt';

      const result = storage.getUrl(filename);

      expect(result).toBe(`${baseUrl}/${filename}`);
    });

    it('should return null on error', () => {
      const filename = 'test.txt';

      const storageWithoutBase = createAzureBlobStorage({
        containerName,
        folderPrefix
      });

      mockContainerClient.getBlockBlobClient.mockImplementation(() => {
        throw new Error('Failed to construct URL');
      });

      const result = storageWithoutBase.getUrl(filename);

      expect(result).toBeNull();

      mockContainerClient.getBlockBlobClient.mockReturnValue(mockBlockBlobClient);
    });
  });

  describe('uploadFile', () => {
    it('should upload file with content type', async () => {
      const folderName = 'test-folder';
      const blobName = 'test.txt';
      const buffer = Buffer.from('test content');
      const contentType = 'text/plain';

      await storage.uploadFile(folderName, blobName, buffer, contentType);

      expect(mockBlockBlobClient.uploadData).toHaveBeenCalledWith(buffer, {
        blobHTTPHeaders: { blobContentType: contentType }
      });
    });
  });

  describe('deleteFileFromAzure', () => {
    it('should delete file from Azure', async () => {
      const folderName = 'test-folder';
      const blobName = 'test.txt';

      await storage.deleteFileFromAzure(folderName, blobName);

      expect(mockBlockBlobClient.deleteIfExists).toHaveBeenCalled();
    });
  });

  describe('constructBlobUrl', () => {
    it('should construct blob URL', () => {
      const folderName = 'test-folder';
      const blobName = 'test.txt';

      const url = storage.constructBlobUrl(folderName, blobName);

      expect(url).toBe(mockBlockBlobClient.url);
    });
  });

  describe('copyBlobsToNewFolder', () => {
    it('should copy blobs to new folder', async () => {
      const oldFolderName = 'old-folder';
      const newFolderName = 'new-folder';
      const blobNames = ['file1.txt', 'file2.txt'];

      const mockPoller = {
        pollUntilDone: jest.fn().mockResolvedValue({})
      };

      mockBlockBlobClient.beginCopyFromURL = jest.fn().mockResolvedValue(mockPoller);

      const result = await storage.copyBlobsToNewFolder(oldFolderName, newFolderName, blobNames);

      expect(result).toHaveLength(blobNames.length);
      expect(mockBlockBlobClient.beginCopyFromURL).toHaveBeenCalledTimes(blobNames.length);
      expect(mockPoller.pollUntilDone).toHaveBeenCalledTimes(blobNames.length);
    });
  });

  describe('streamBlob', () => {
    it('should stream blob without range header', async () => {
      const url = 'https://test.blob.core.windows.net/test.txt';
      const mockBody = 'test content';

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        body: mockBody,
        headers: {
          get: jest.fn((key: string) => {
            if (key === 'Content-Type') return 'text/plain';
            if (key === 'Content-Length') return '12';
            return null;
          }),
          has: jest.fn(() => false)
        }
      });

      const response = await storage.streamBlob(url, null);

      expect(response.status).toBe(200);
      expect(globalThis.fetch).toHaveBeenCalledWith(url, {
        method: 'GET',
        headers: {},
        next: { revalidate: 0 }
      });
    });

    it('should stream blob with range header', async () => {
      const url = 'https://test.blob.core.windows.net/test.txt';
      const rangeHeader = 'bytes=0-1023';

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 206,
        statusText: 'Partial Content',
        body: 'partial content',
        headers: {
          get: jest.fn((key: string) => {
            if (key === 'Content-Type') return 'text/plain';
            if (key === 'Content-Length') return '1024';
            if (key === 'Content-Range') return 'bytes 0-1023/10240';
            return null;
          }),
          has: jest.fn((key: string) => key === 'Content-Range')
        }
      });

      const response = await storage.streamBlob(url, rangeHeader);

      expect(response.status).toBe(206);
      expect(globalThis.fetch).toHaveBeenCalledWith(url, {
        method: 'GET',
        headers: { Range: rangeHeader },
        next: { revalidate: 0 }
      });
    });
  });
});
