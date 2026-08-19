import { GraphQLError } from 'graphql';

import { CompositionsMutation } from './compositionsMutation';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import type { Composition } from '~/domain/entities/Composition';
import { compositionsServiceErrors } from '~/src/constants/errors';
import type { CompositionInput, ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import type {
  CompositionAudioInput,
  CompositionSheetMusicInput,
  CreateCompositionInput,
  UpdateCompositionInput
} from '~/types/graphql/generated/graphql';

jest.mock('~/src/infrastructure/repositories/helpers', () => ({
  withTransaction: jest.fn(async (callback: (session: object) => Promise<unknown>) => callback({}))
}));

type AdminContextType = NonNullable<GraphQLContext['admin']>;

type MockCompositionsRepository = {
  [K in keyof ICompositionRepository]-?: jest.Mock;
};

type MockOpusRepository = {
  moveCompositionsToCompositionsOpus: jest.Mock;
  removeCompositionsFromCompositionsOpus: jest.Mock;
};

describe('CompositionsMutation', () => {
  const MOCK_ADMIN: AdminContextType = {
    id: 'admin-id',
    email: 'admin@example.com',
    role: 'ADMIN',
  } as unknown as AdminContextType;

  const MOCK_COMPOSITION_ID = 'composition-id';

  const MOCK_SHEET_MUSIC: CompositionSheetMusicInput[] = [
    { title: 'Sheet 1', fileUrl: 'https://example.com/sheet1.pdf' } as CompositionSheetMusicInput,
  ];

  const MOCK_AUDIOS: CompositionAudioInput[] = [
    { title: 'Audio 1', fileUrl: 'https://example.com/audio1.mp3' } as unknown as CompositionAudioInput,
  ];

  const MOCK_INPUT: CreateCompositionInput = {
    name: { uk: 'Тестова композиція', en: 'Test Composition' },
    year: 2026,
    genre: 'Classical',
    audioAvailable: true,
    sheetAvailable: false,
    sheetMusic: MOCK_SHEET_MUSIC,
    audios: MOCK_AUDIOS,
  };

  const MOCK_INPUT_PARTIAL: CreateCompositionInput = {
    name: { uk: 'Часткова композиція', en: 'Partial Composition' },
    year: undefined,
    genre: undefined,
    audioAvailable: undefined,
    sheetAvailable: undefined,
    sheetMusic: undefined,
    audios: undefined,
  };

  const MOCK_MAPPED_INPUT: CompositionInput = {
    name: MOCK_INPUT.name,
    year: MOCK_INPUT.year ?? null,
    genre: MOCK_INPUT.genre ?? null,
    audioAvailable: MOCK_INPUT.audioAvailable ?? false,
    sheetAvailable: MOCK_INPUT.sheetAvailable ?? false,
    sheetMusic: MOCK_INPUT.sheetMusic ?? [],
    audios: MOCK_INPUT.audios ?? [],
  };

  const MOCK_MAPPED_INPUT_PARTIAL: CompositionInput = {
    name: MOCK_INPUT_PARTIAL.name,
    year: null,
    genre: null,
    audioAvailable: false,
    sheetAvailable: false,
    sheetMusic: [],
    audios: [],
  };

  const MOCK_COMPOSITION: Composition = {
    id: MOCK_COMPOSITION_ID,
    name: MOCK_INPUT.name,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    year: MOCK_INPUT.year ?? null,
    genre: MOCK_INPUT.genre ?? null,
    audioAvailable: MOCK_INPUT.audioAvailable ?? false,
    sheetAvailable: MOCK_INPUT.sheetAvailable ?? false,
    sheetMusic: [],
    audios: [],
  };

  const createMockCompositionsRepository = (
    overrides: Partial<MockCompositionsRepository> = {}
  ): MockCompositionsRepository =>
    new Proxy(
      {
        findById: jest.fn().mockResolvedValue(MOCK_COMPOSITION),
        create: jest.fn().mockResolvedValue(MOCK_COMPOSITION),
        update: jest.fn().mockResolvedValue(MOCK_COMPOSITION),
        delete: jest.fn().mockResolvedValue(true),
        findAll: jest.fn().mockResolvedValue([MOCK_COMPOSITION]),
        ...overrides,
      } as MockCompositionsRepository,
      {
        get: (target, prop: string | symbol) => {
          if (prop in target) {
            return target[prop as keyof MockCompositionsRepository];
          }
          return jest.fn();
        },
      }
    );

  const createMockOpusRepository = (
    overrides: Partial<MockOpusRepository> = {}
  ): MockOpusRepository => ({
    moveCompositionsToCompositionsOpus: jest.fn().mockResolvedValue(undefined),
    removeCompositionsFromCompositionsOpus: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  const createMockContext = (
    admin: AdminContextType | null = MOCK_ADMIN,
    compositionsRepoMock: Partial<MockCompositionsRepository> = {},
    opusRepoMock: Partial<MockOpusRepository> = {}
  ): GraphQLContext => {
    const compositionsRepository = createMockCompositionsRepository(compositionsRepoMock);
    const opusRepository = createMockOpusRepository(opusRepoMock);

    return {
      admin,
      requestContainer: {
        cradle: {
          compositionsRepository,
          opusRepository,
        },
      },
    } as unknown as GraphQLContext;
  };

  describe('createComposition', () => {
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
      const context = createMockContext(
        MOCK_ADMIN,
        { create: createMock },
        { moveCompositionsToCompositionsOpus: moveMock }
      );

      const result = await CompositionsMutation.createComposition(null, { input: MOCK_INPUT }, context);

      expect(createMock).toHaveBeenCalledWith(MOCK_MAPPED_INPUT, expect.anything());
      expect(moveMock).toHaveBeenCalledWith([MOCK_COMPOSITION_ID], expect.anything());
      expect(result).toEqual(MOCK_COMPOSITION);
    });

    it('should reject an existing name before creating', async () => {
      const context = createMockContext(MOCK_ADMIN, {
        findByName: jest.fn().mockResolvedValue(MOCK_COMPOSITION)
      });

      await expect(
        CompositionsMutation.createComposition(null, { input: MOCK_INPUT }, context)
      ).rejects.toMatchObject({
        message: `Композиція "${MOCK_INPUT.name.uk}" вже існує`,
        extensions: { code: 'COMPOSITION_NAME_TAKEN' }
      });
      expect(context.requestContainer.cradle.compositionsRepository.create).not.toHaveBeenCalled();
    });

    it('should trim localized names and translate a duplicate-key create error', async () => {
      const createMock = jest.fn().mockRejectedValue({ code: 11000, keyValue: { 'name.uk': 'Trimmed' } });
      const context = createMockContext(MOCK_ADMIN, {
        findByName: jest.fn().mockResolvedValue(null),
        create: createMock
      });

      await expect(
        CompositionsMutation.createComposition(null, {
          input: { ...MOCK_INPUT, name: { uk: '  Trimmed  ', en: '  English  ' } }
        }, context)
      ).rejects.toMatchObject({
        message: 'Композиція "Trimmed" вже існує',
        extensions: { code: 'COMPOSITION_NAME_TAKEN' }
      });
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: { uk: 'Trimmed', en: 'English' } }),
        expect.anything()
      );
    });

    it('should correctly fallback optional fields when input values are missing', async () => {
      const createMock = jest.fn().mockResolvedValue(MOCK_COMPOSITION);
      const moveMock = jest.fn().mockResolvedValue(undefined);
      const context = createMockContext(
        MOCK_ADMIN,
        { create: createMock },
        { moveCompositionsToCompositionsOpus: moveMock }
      );

      await CompositionsMutation.createComposition(null, { input: MOCK_INPUT_PARTIAL }, context);

      expect(createMock).toHaveBeenCalledWith(MOCK_MAPPED_INPUT_PARTIAL, expect.anything());
    });
  });

  describe('updateComposition', () => {
    const updateInputFull: UpdateCompositionInput = {
      name: { uk: 'Оновлена назва', en: 'Updated Name' },
      year: 2025,
      genre: 'Jazz',
      audioAvailable: false,
      sheetAvailable: true,
      sheetMusic: MOCK_SHEET_MUSIC,
      audios: MOCK_AUDIOS,
    };

    it('should throw unauthenticated error when admin is missing', async () => {
      const context = createMockContext(null);

      await expect(
        CompositionsMutation.updateComposition(
          null,
          { id: MOCK_COMPOSITION_ID, input: updateInputFull },
          context
        )
      ).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code },
        })
      );
    });

    it('should throw GraphQLError when composition is not found', async () => {
      const context = createMockContext(MOCK_ADMIN, {
        findById: jest.fn().mockResolvedValue(null),
      });

      await expect(
        CompositionsMutation.updateComposition(
          null,
          { id: MOCK_COMPOSITION_ID, input: updateInputFull },
          context
        )
      ).rejects.toThrow(
        new GraphQLError(compositionsServiceErrors.COMPOSITION_NOT_FOUND(MOCK_COMPOSITION_ID), {
          extensions: { code: 'COMPOSITION_NOT_FOUND' },
        })
      );
    });

    it('should throw GraphQLError when update returns null', async () => {
      const context = createMockContext(MOCK_ADMIN, {
        findById: jest.fn().mockResolvedValue(MOCK_COMPOSITION),
        update: jest.fn().mockResolvedValue(null),
      });

      await expect(
        CompositionsMutation.updateComposition(
          null,
          { id: MOCK_COMPOSITION_ID, input: updateInputFull },
          context
        )
      ).rejects.toThrow(
        new GraphQLError(`Failed to update composition with id ${MOCK_COMPOSITION_ID}`, {
          extensions: { code: 'COMPOSITION_UPDATE_FAILED' },
        })
      );
    });

    it('should successfully update composition with all provided input fields', async () => {
      const updateMock = jest.fn().mockResolvedValue({
        ...MOCK_COMPOSITION,
        ...updateInputFull,
      });

      const context = createMockContext(MOCK_ADMIN, {
        findById: jest.fn().mockResolvedValue(MOCK_COMPOSITION),
        update: updateMock,
      });

      const result = await CompositionsMutation.updateComposition(
        null,
        { id: MOCK_COMPOSITION_ID, input: updateInputFull },
        context
      );

      expect(updateMock).toHaveBeenCalledWith(MOCK_COMPOSITION_ID, {
        name: updateInputFull.name,
        year: updateInputFull.year,
        genre: updateInputFull.genre,
        audioAvailable: updateInputFull.audioAvailable,
        sheetAvailable: updateInputFull.sheetAvailable,
        sheetMusic: updateInputFull.sheetMusic,
        audios: updateInputFull.audios,
      });
      expect(result).toEqual({
        ...MOCK_COMPOSITION,
        ...updateInputFull,
      });
    });

    it('should allow updating a composition without changing ownership of its name', async () => {
      const updateMock = jest.fn().mockResolvedValue(MOCK_COMPOSITION);
      const context = createMockContext(MOCK_ADMIN, {
        findById: jest.fn().mockResolvedValue(MOCK_COMPOSITION),
        findByName: jest.fn().mockResolvedValue(MOCK_COMPOSITION),
        update: updateMock
      });

      await CompositionsMutation.updateComposition(
        null,
        { id: MOCK_COMPOSITION_ID, input: { name: { uk: '  Соната  ', en: '  Sonata  ' } } },
        context
      );

      expect(updateMock).toHaveBeenCalledWith(MOCK_COMPOSITION_ID, {
        name: { uk: 'Соната', en: 'Sonata' }
      });
    });

    it('should translate a duplicate-key update error', async () => {
      const context = createMockContext(MOCK_ADMIN, {
        findById: jest.fn().mockResolvedValue(MOCK_COMPOSITION),
        findByName: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockRejectedValue({ code: 11000, keyValue: { 'name.uk': 'Taken' } })
      });

      await expect(
        CompositionsMutation.updateComposition(
          null,
          { id: MOCK_COMPOSITION_ID, input: { name: { uk: 'Taken', en: 'Taken' } } },
          context
        )
      ).rejects.toMatchObject({
        message: 'Композиція "Taken" вже існує',
        extensions: { code: 'COMPOSITION_NAME_TAKEN' }
      });
    });

    it('should process undefined and null values in update input correctly', async () => {
      const partialUpdateInput: UpdateCompositionInput = {
        year: null,
      };

      const updateMock = jest.fn().mockResolvedValue(MOCK_COMPOSITION);

      const context = createMockContext(MOCK_ADMIN, {
        findById: jest.fn().mockResolvedValue(MOCK_COMPOSITION),
        update: updateMock,
      });

      await CompositionsMutation.updateComposition(
        null,
        { id: MOCK_COMPOSITION_ID, input: partialUpdateInput },
        context
      );

      expect(updateMock).toHaveBeenCalledWith(MOCK_COMPOSITION_ID, {
        year: null,
      });
    });
  });

  describe('deleteComposition', () => {
    it('should throw unauthenticated error when admin is missing', async () => {
      const context = createMockContext(null);

      await expect(
        CompositionsMutation.deleteComposition(null, { id: MOCK_COMPOSITION_ID }, context)
      ).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code },
        })
      );
    });

    it('should throw error when composition to delete is not found', async () => {
      const context = createMockContext(MOCK_ADMIN, {
        findById: jest.fn().mockResolvedValue(null),
      });

      await expect(
        CompositionsMutation.deleteComposition(null, { id: MOCK_COMPOSITION_ID }, context)
      ).rejects.toThrow(
        new GraphQLError(compositionsServiceErrors.COMPOSITION_NOT_FOUND(MOCK_COMPOSITION_ID), {
          extensions: { code: 'COMPOSITION_NOT_FOUND' },
        })
      );
    });

    it('should successfully remove composition from opus repository and delete it', async () => {
      const deleteMock = jest.fn().mockResolvedValue(true);
      const removeMock = jest.fn().mockResolvedValue(undefined);

      const context = createMockContext(
        MOCK_ADMIN,
        {
          findById: jest.fn().mockResolvedValue(MOCK_COMPOSITION),
          delete: deleteMock,
        },
        {
          removeCompositionsFromCompositionsOpus: removeMock,
        }
      );

      const result = await CompositionsMutation.deleteComposition(
        null,
        { id: MOCK_COMPOSITION_ID },
        context
      );

      expect(removeMock).toHaveBeenCalledWith([MOCK_COMPOSITION_ID], expect.anything());
      expect(deleteMock).toHaveBeenCalledWith(MOCK_COMPOSITION_ID, expect.anything());
      expect(result).toBe(true);
    });
  });
});
