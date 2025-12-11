import { authMutation as AdminMutation } from './admin/AuthMutation';
import { EventMutation } from './admin/EventMutation';
import { EventQuery } from './admin/EventQuery';
import { PageMutation } from './admin/PageMutation';
import { Query as AdminQuery } from './admin/Query';
import { blobMutations as BlobMutation } from './blobStorage/blobMutation';

export const resolvers = {
  Mutation: {
    ...AdminMutation,
    ...BlobMutation,
    ...PageMutation,
    ...EventMutation
  },
  Query: {
    ...AdminQuery,
    ...EventQuery
  }
};
