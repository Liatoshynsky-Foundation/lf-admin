import { authMutation as AdminMutation } from './admin/AuthMutation';
import { authQuery as AuthQuery } from './admin/AuthQuery';
import { AssetsMutation, AssetsQuery } from './assets/Query';
import { blobMutations as BlobMutation } from './blobStorage/blobMutation';
import { EventsMutation } from './events/eventsMutation';
import { EventsQuery } from './events/eventsQuery';
import { MediaMentionsMutation } from './media-mentions/mediaMentionMutation';
import { MediaMentionsQuery } from './media-mentions/mediaMentionQuery';
import { NewsMutation } from './news/newsMutation';
import { NewsQuery } from './news/newsQuery';
import { PageMutation } from './page/PageMutation';
import { Query as AdminQuery } from './page/Query';

export const resolvers = {
  Mutation: {
    ...AdminMutation,
    ...BlobMutation,
    ...PageMutation,
    ...NewsMutation,
    ...MediaMentionsMutation,
    ...EventsMutation,
    ...AssetsMutation
  },
  Query: {
    ...AdminQuery,
    ...AuthQuery,
    ...NewsQuery,
    ...MediaMentionsQuery,
    ...EventsQuery,
    ...AssetsQuery
  }
};
