import { authMutation as AdminMutation } from './admin/AuthMutation';
import { blobMutations as BlobMutation } from './blobStorage/blobMutation';
import { EventsMutation } from './events/EventsMutation';
import { EventsQuery } from './events/EventsQuery';
import { MediaMentionsMutation } from './media-mentions/MedeaMentionMutation';
import { MediaMentionsQuery } from './media-mentions/MedeaMentionQuery';
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
    ...MediaMentionsMutation,
    ...EventsMutation
  },
  Query: {
    ...AdminQuery,
    ...NewsQuery,
    ...MediaMentionsQuery,
    ...EventsQuery
  }
};
