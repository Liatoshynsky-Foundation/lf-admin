import { authMutation as AdminMutation } from './admin/AuthMutation';
import { NewsMutation } from './admin/NewsMutation';
import { NewsQuery } from './admin/NewsQuery';
import { PageMutation } from './admin/PageMutation';
import { Query as AdminQuery } from './admin/Query';
import { blobMutations as BlobMutation } from './blobStorage/blobMutation';

export const resolvers = {
  Mutation: {
    ...AdminMutation,
    ...BlobMutation,
    ...PageMutation,
    ...NewsMutation
  },
  Query: {
    ...AdminQuery,
    ...NewsQuery
  }
};
