import { authMutation as AdminMutation } from './admin/AuthMutation';
import { Query as AdminQuery } from './admin/Query';
import { blobMutations as BlobMutation } from './blobStorage/blobMutation';

export const resolvers = {
  Mutation: {
    ...AdminMutation,
    ...BlobMutation
  },
  Query: {
    ...AdminQuery
  }
};
