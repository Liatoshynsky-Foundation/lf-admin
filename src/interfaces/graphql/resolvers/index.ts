import { authMutation as AdminMutation } from './admin/AuthMutation';
import { authQuery as AuthQuery } from './admin/AuthQuery';
import { AssetsMutation, AssetsQuery } from './assets/Query';
import { CaseMutation } from './case/caseMutation';
import { CaseQuery } from './case/caseQuery';
import { CompositionsMutation } from './compositions/compositionsMutation';
import { CompositionsQuery } from './compositions/compositionsQuery';
import { EventsMutation } from './events/eventsMutation';
import { EventsQuery } from './events/eventsQuery';
import { FondMutation } from './fond/fondMutation';
import { FondQuery } from './fond/fondQuery';
import { MediaMentionsMutation } from './media-mentions/mediaMentionMutation';
import { MediaMentionsQuery } from './media-mentions/mediaMentionQuery';
import { NewsMutation } from './news/newsMutation';
import { NewsQuery } from './news/newsQuery';
import { OpusMutation } from './opus/opusMutation';
import { OpusQuery } from './opus/opusQuery';
import { PageMutation } from './page/PageMutation';
import { Query as AdminQuery } from './page/Query';

export const resolvers = {
  Mutation: {
    ...AdminMutation,
    ...PageMutation,
    ...NewsMutation,
    ...MediaMentionsMutation,
    ...EventsMutation,
    ...OpusMutation,
    ...AssetsMutation,
    ...CompositionsMutation,
    ...CaseMutation,
    ...FondMutation
  },
  Query: {
    ...AdminQuery,
    ...AuthQuery,
    ...NewsQuery,
    ...MediaMentionsQuery,
    ...EventsQuery,
    ...OpusQuery,
    ...AssetsQuery,
    ...CompositionsQuery,
    ...CaseQuery,
    ...FondQuery
  }
};
