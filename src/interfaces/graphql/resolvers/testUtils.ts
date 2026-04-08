import { GraphQLContext } from '~/back-shared/types/container/types';

export const createMockContext = (isAdmin: boolean, repoKey: string, mockRepo: unknown): GraphQLContext => ({
  admin: isAdmin,
  requestContainer: {
    cradle: { [repoKey]: mockRepo },
  },
} as unknown as GraphQLContext);