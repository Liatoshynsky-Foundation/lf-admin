import { AwilixContainer } from 'awilix';
import { GraphQLError } from 'graphql';

import { blobMutations } from './blobMutation';
import { GraphQLContext } from '~/back-shared/types/container/types';

const mockUploadService = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn()
};

const mockRequestContainer = {
  resolve: jest.fn().mockReturnValue(mockUploadService)
} as unknown as AwilixContainer;

const adminContext: GraphQLContext = {
  requestContainer: mockRequestContainer,
  admin: {
    id: 'admin123',
    type: 'admin',
    refreshJti: 'jti123'
  },
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
  cookieActions: []
};

const noAdminContext: GraphQLContext = {
  requestContainer: mockRequestContainer,
  admin: null,
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
  cookieActions: []
};

describe('blobMutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadBlob', () => {
    const uploadArgs = {
      folderName: 'test-folder',
      blobName: 'test-blob.jpg',
      buffer: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      contentType: 'image/jpeg'
    };

    it('should throw UNAUTHENTICATED error if no admin', async () => {
      await expect(blobMutations.uploadBlob(null, uploadArgs, noAdminContext)).rejects.toThrow(
        new GraphQLError('You must be logged in to access this resource.', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      );
      expect(mockRequestContainer.resolve).not.toHaveBeenCalled();
    });

    it('should upload file successfully and return success response', async () => {
      mockUploadService.uploadFile.mockResolvedValue(undefined);

      const result = await blobMutations.uploadBlob(null, uploadArgs, adminContext);

      expect(mockRequestContainer.resolve).toHaveBeenCalledWith('uploadService');
      expect(mockUploadService.uploadFile).toHaveBeenCalledWith(
        uploadArgs.folderName,
        uploadArgs.blobName,
        expect.any(Buffer),
        uploadArgs.contentType
      );
      expect(result).toEqual({
        success: true,
        blobName: uploadArgs.blobName
      });
    });

    it('should return failure response if upload fails', async () => {
      mockUploadService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      const result = await blobMutations.uploadBlob(null, uploadArgs, adminContext);

      expect(mockRequestContainer.resolve).toHaveBeenCalledWith('uploadService');
      expect(mockUploadService.uploadFile).toHaveBeenCalled();
      expect(result).toEqual({
        success: false
      });
    });
  });

  describe('deleteBlob', () => {
    const deleteArgs = {
      folderName: 'test-folder',
      blobName: 'test-blob.jpg'
    };

    it('should throw UNAUTHENTICATED error if no admin', async () => {
      await expect(blobMutations.deleteBlob(null, deleteArgs, noAdminContext)).rejects.toThrow(
        new GraphQLError('You must be logged in to access this resource.', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      );
      expect(mockRequestContainer.resolve).not.toHaveBeenCalled();
    });

    it('should delete file successfully and return success response', async () => {
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      const result = await blobMutations.deleteBlob(null, deleteArgs, adminContext);

      expect(mockRequestContainer.resolve).toHaveBeenCalledWith('uploadService');
      expect(mockUploadService.deleteFile).toHaveBeenCalledWith(deleteArgs.folderName, deleteArgs.blobName);
      expect(result).toEqual({
        success: true,
        blobName: deleteArgs.blobName
      });
    });

    it('should return failure response if delete fails', async () => {
      mockUploadService.deleteFile.mockRejectedValue(new Error('Delete failed'));

      const result = await blobMutations.deleteBlob(null, deleteArgs, adminContext);

      expect(mockRequestContainer.resolve).toHaveBeenCalledWith('uploadService');
      expect(mockUploadService.deleteFile).toHaveBeenCalled();
      expect(result).toEqual({
        success: false
      });
    });
  });
});
