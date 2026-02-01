import { authMutation as AdminMutation } from './admin/AuthMutation';
import { blobMutations as BlobMutation } from './blobStorage/blobMutation';
import { MediaMentionsMutation } from './media-mentions/Mutation';
import { MediaMentionsQuery } from './media-mentions/Query';
import { NewsMutation } from './news/NewsMutation';
import { NewsQuery } from './news/NewsQuery';
import { PageMutation } from './page/PageMutation';
import { Query as AdminQuery } from './page/Query';

export const resolvers = {
  Mutation: {
    ...AdminMutation,
    ...BlobMutation,
    ...PageMutation,
    ...NewsMutation,
    ...MediaMentionsMutation
  },
  Query: {
    ...AdminQuery,
    ...NewsQuery,
    ...MediaMentionsQuery
  }
};
