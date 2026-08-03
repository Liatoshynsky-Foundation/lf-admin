import { GraphQLError } from 'graphql';

import { CompositionsQuery } from './compositionsQuery';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import type { Composition } from '~/domain/entities/Composition';

describe('CompositionsQuery', () => {
  const mockComposition: Composition = {
    id: 'comp-123',
  } as Composition;

  const createMockContext = (
    admin: GraphQLContext['admin'] = null,
    findByIdMock = jest.fn()
  ): GraphQLContext =>
    ({
      admin,
      requestContainer: {
        cradle: {
          compositionsRepository: {
            findById: findByIdMock,
          },
        },
      },
    } as unknown as GraphQLContext);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('compositionById', () => {
    it('should throw UNAUTHENTICATED error when user is not an admin', async () => {
      const context = createMockContext(null);

      await expect(
        CompositionsQuery.compositionById({}, { id: 'comp-123' }, context)
      ).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code },
        })
      );
    });

    it('should return composition when found', async () => {
      const findByIdMock = jest.fn().mockResolvedValue(mockComposition);
      const mockAdmin = { id: 'admin-1' } as NonNullable<GraphQLContext['admin']>;
      const context = createMockContext(mockAdmin, findByIdMock);

      const result = await CompositionsQuery.compositionById(
        {},
        { id: 'comp-123' },
        context
      );

      expect(findByIdMock).toHaveBeenCalledWith('comp-123');
      expect(result).toEqual(mockComposition);
    });

    it('should return null when composition is not found', async () => {
      const findByIdMock = jest.fn().mockResolvedValue(null);
      const mockAdmin = { id: 'admin-1' } as NonNullable<GraphQLContext['admin']>;
      const context = createMockContext(mockAdmin, findByIdMock);

      const result = await CompositionsQuery.compositionById(
        {},
        { id: 'comp-123' },
        context
      );

      expect(findByIdMock).toHaveBeenCalledWith('comp-123');
      expect(result).toBeNull();
    });
  });
});