import { GraphQLContext } from '~/back-shared/types/container/types';

export const mongooseMock = {
  Schema: jest.fn().mockImplementation(() => ({
    index: jest.fn(),
  })),
  Types: {
    ObjectId: jest.fn().mockImplementation(() => 'mocked-id'),
  },
  model: jest.fn().mockReturnValue({}),
  models: {},
};

export const createMockContext = (isAdmin: boolean, repoKey: string, mockRepo: unknown): GraphQLContext => ({
  admin: isAdmin,
  requestContainer: {
    cradle: { [repoKey]: mockRepo }
  }
} as unknown as GraphQLContext);