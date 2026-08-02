import { GraphQLError } from 'graphql';

import { CompositionsMutation } from './compositionsMutation';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import type { Composition } from '~/domain/entities/Composition';
import { compositionsServiceErrors } from '~/src/constants/errors';
import type { CreateCompositionInput } from '~/types/graphql/generated/graphql';

describe('CompositionsMutation', () => {
  const MOCK_ADMIN = { id: 'admin-id' };
  const MOCK_COMPOSITION_ID = 'composition-id';
  const MOCK_INPUT: CreateCompositionInput = {
    name: 'Test Composition',
    year: 2026,
    genre: 'Classical',
    audioAvailable: true,
    sheetAvailable: false,
  };

  const MOCK_INPUT_PARTIAL: CreateCompositionInput = {
    name: 'Partial Composition',
    year: undefined,
    genre: undefined,
    audioAvailable: undefined,
    sheetAvailable: undefined,
  };

  const MOCK_MAPPED_INPUT = {
    name: MOCK_INPUT.name,
    year: MOCK_INPUT.year,
    genre: MOCK_INPUT.genre,
    audioAvailable: MOCK_INPUT.audioAvailable,
    sheetAvailable: MOCK_INPUT.sheetAvailable,
    sheetMusic: [],
    audios: [],
  };

  const MOCK_MAPPED_INPUT_PARTIAL = {
    name: MOCK_INPUT_PARTIAL.name,
    year: null,
    genre: null,
    audioAvailable: false,
    sheetAvailable: false,
    sheetMusic: [],
    audios: [],
  };

  const MOCK_COMPOSITION: Composition = {
    name: { uk: MOCK_INPUT.name, en: MOCK_INPUT.name },
    id: MOCK_COMPOSITION_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    year: MOCK_INPUT.year ?? null,
    genre: MOCK_INPUT.genre ?? null,
    audioAvailable: MOCK_INPUT.audioAvailable ?? false,
    sheetAvailable: MOCK_INPUT.sheetAvailable ?? false,
    sheetMusic: [],
    audios: [],
  };

  const createMockContext = (admin: unknown = MOCK_ADMIN, repoMock = {}, opusRepoMock = {}): GraphQLContext => ({
    admin,
    requestContainer: {
      cradle: {
        compositionsRepository: {
          create: jest.fn().mockResolvedValue(MOCK_COMPOSITION),
          ...repoMock,
        },
        opusRepository: {
          moveCompositionsToCompositionsOpus: jest.fn().mockResolvedValue(undefined),
          ...opusRepoMock,
        },
      },
    },
  } as unknown as GraphQLContext);

  it('should throw unauthenticated error when admin is missing', async () => {
    const context = createMockContext(null);

    await expect(
      CompositionsMutation.createComposition(null, { input: MOCK_INPUT }, context)
    ).rejects.toThrow(
      new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
        extensions: { code: graphqlErrors.UNAUTHENTICATED.code },
      })
    );
  });

  it('should throw error when composition creation fails', async () => {
    const context = createMockContext(MOCK_ADMIN, {
      create: jest.fn().mockResolvedValue(null),
    });

    await expect(
      CompositionsMutation.createComposition(null, { input: MOCK_INPUT }, context)
    ).rejects.toThrow(new Error(compositionsServiceErrors.COMPOSITION_NOT_CREATED));
  });

  it('should successfully create composition and move it to compositions opus', async () => {
    const createMock = jest.fn().mockResolvedValue(MOCK_COMPOSITION);
    const moveMock = jest.fn().mockResolvedValue(undefined);
    const context = createMockContext(MOCK_ADMIN, { create: createMock }, { moveCompositionsToCompositionsOpus: moveMock });

    const result = await CompositionsMutation.createComposition(null, { input: MOCK_INPUT }, context);

    expect(createMock).toHaveBeenCalledWith(MOCK_MAPPED_INPUT);
    expect(moveMock).toHaveBeenCalledWith([MOCK_COMPOSITION_ID]);
    expect(result).toEqual(MOCK_COMPOSITION);
  });

  it('should correctly fallback optional fields when input values are missing', async () => {
    const createMock = jest.fn().mockResolvedValue(MOCK_COMPOSITION);
    const moveMock = jest.fn().mockResolvedValue(undefined);
    const context = createMockContext(MOCK_ADMIN, { create: createMock }, { moveCompositionsToCompositionsOpus: moveMock });

    await CompositionsMutation.createComposition(null, { input: MOCK_INPUT_PARTIAL }, context);

    expect(createMock).toHaveBeenCalledWith(MOCK_MAPPED_INPUT_PARTIAL);
  });
});
