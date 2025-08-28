import { GraphQLError } from 'graphql';

import { DeleteBlobArgs, UploadBlobArgs } from '~/back-shared/types/blob/types';
import { GraphQLContext } from '~/back-shared/types/container/types';

export const blobMutations = {
  uploadBlob: async (_: unknown, args: UploadBlobArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError('You must be logged in to access this resource.', {
        extensions: {
          code: 'UNAUTHENTICATED'
        }
      });
    }
    const uploadService = context.requestContainer.resolve('uploadService');
    const buffer = Buffer.from(args.buffer, 'base64');
    try {
      await uploadService.uploadFile(args.folderName, args.blobName, buffer, args.contentType);
      return {
        success: true,
        blobName: args.blobName
      };
    } catch {
      return {
        success: false
      };
    }
  },
  deleteBlob: async (_: unknown, args: DeleteBlobArgs, context: GraphQLContext) => {
    if (!context.admin) {
      throw new GraphQLError('You must be logged in to access this resource.', {
        extensions: {
          code: 'UNAUTHENTICATED'
        }
      });
    }
    const uploadService = context.requestContainer.resolve('uploadService');
    try {
      await uploadService.deleteFile(args.folderName, args.blobName);
      return {
        success: true,
        blobName: args.blobName
      };
    } catch {
      return {
        success: false
      };
    }
  }
};
