import { authMutation as AdminMutation } from './admin/AuthMutation';
import { PageMutation } from './admin/PageMutation';
import { Query as AdminQuery } from './admin/Query';
import { blobMutations as BlobMutation } from './blobStorage/blobMutation';

export const resolvers = {
  Mutation: {
    ...AdminMutation,
    ...BlobMutation,
    ...PageMutation
  },
  Query: {
    ...AdminQuery
  }
};
