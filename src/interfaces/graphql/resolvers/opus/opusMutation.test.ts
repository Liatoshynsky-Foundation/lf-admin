import { GraphQLError } from 'graphql';

import { markImagesAsUsed, processSlugUpdate, syncImagesCrops } from '../helpers';
import { OpusMutation } from './opusMutation';
import { orderCompositionsByIds } from './tab-handlers/tabHandlersHelpers';
import { opusServiceErrors } from '~/back-constants/errors';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import type { Opus } from '~/domain/entities/Opus';
import type { ICompositionRepository } from '~/domain/repositories/compositionRepository';
import type { IOpusRepository } from '~/domain/repositories/opusRepository';
import { Composition } from '~/src/domain/entities/Composition';
import { generateUniqueSlug } from '~/src/shared/utils/slugGenerator/slugGenerator';
import { OpusStatus } from '~/types/graphql/generated/graphql';

jest.mock('../helpers');
jest.mock('./tab-handlers/tabHandlersHelpers');
jest.mock('~/src/shared/utils/slugGenerator/slugGenerator');

const mockedSyncImagesCrops = syncImagesCrops as jest.MockedFunction<typeof syncImagesCrops>;
const mockedMarkImagesAsUsed = markImagesAsUsed as jest.MockedFunction<typeof markImagesAsUsed>;
const mockedProcessSlugUpdate = processSlugUpdate as jest.MockedFunction<typeof processSlugUpdate>;
const mockedOrderCompositionsByIds = orderCompositionsByIds as jest.MockedFunction<typeof orderCompositionsByIds>;
const mockedGenerateUniqueSlug = generateUniqueSlug as jest.MockedFunction<typeof generateUniqueSlug>;

const OPUS_ID = 'opus-1';
const OTHER_OPUS_ID = 'opus-2';
const COMPOSITION_ID_1 = 'comp-1';
const COMPOSITION_ID_2 = 'comp-2';
const COMPOSITION_ID_3 = 'comp-3';
const OPUS_NUMBER = 10;
const DUP_OPUS_NUMBER = 20;
const SLUG_VALUE = 'slug-test';
const CREATION_YEAR = '2020';

const BASE_CREATE_INPUT = {
  numberKind: 'op' as const,
  number: OPUS_NUMBER,
  name: { uk: 'Назва', en: 'Name' },
  creationYear: CREATION_YEAR,
  title: { uk: 'Заголовок', en: 'Title' },
  description: { uk: '{"type":"doc","content":[]}', en: '{"type":"doc","content":[]}' }
};

const BASE_UPDATE_INPUT = {
  numberKind: 'op' as const,
  number: OPUS_NUMBER,
  name: { uk: 'Назва', en: 'Name' },
  creationYear: CREATION_YEAR
};

const MOCK_OPUS_ENTITY: Opus = {
  id: OPUS_ID,
  number: OPUS_NUMBER,
  numberKind: 'op',
  title: { uk: 'Опус', en: 'Opus' },
  name: { uk: 'Назва', en: 'Name' },
  status: OpusStatus.Draft,
  meta: { views: 0 },
  compositions: [COMPOSITION_ID_1, COMPOSITION_ID_2],
} as unknown as Opus;

const MOCK_COMPOSITION_1 = { id: COMPOSITION_ID_1 } as Composition;
const MOCK_COMPOSITION_2 = { id: COMPOSITION_ID_2 } as Composition;
const MOCK_COMPOSITION_3 = { id: COMPOSITION_ID_3 } as Composition;

describe('OpusMutation Resolvers', () => {
  let mockOpusRepo: jest.Mocked<IOpusRepository>;
  let mockCompositionsRepo: jest.Mocked<ICompositionRepository>;
  let adminContext: GraphQLContext;
  let userContext: GraphQLContext;

  const createMockContext = (isAdmin: boolean): {
    context: GraphQLContext;
    opusRepo: jest.Mocked<IOpusRepository>;
    compositionsRepo: jest.Mocked<ICompositionRepository>;
  } => {
    const opusRepo = {
      findById: jest.fn(),
      findByNumber: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      findPaginated: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      unlink: jest.fn(),
      removeCompositionsFromCompositionsOpus: jest.fn(),
      moveCompositionsToCompositionsOpus: jest.fn(),
    } as unknown as jest.Mocked<IOpusRepository>;

    const compositionsRepo = {
      findByOpusId: jest.fn(),
      findByOpusIds: jest.fn(),
      findByIds: jest.fn(),
      syncForOpus: jest.fn().mockResolvedValue([]),
      deleteByOpusId: jest.fn(),
      searchByTitle: jest.fn(),
    } as unknown as jest.Mocked<ICompositionRepository>;

    const context = {
      admin: isAdmin,
      requestContainer: {
        cradle: {
          opusRepository: opusRepo,
          compositionsRepository: compositionsRepo,
          assetsRepository: {},
        },
      },
    } as unknown as GraphQLContext;

    return { context, opusRepo, compositionsRepo };
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const adminSetup = createMockContext(true);
    adminContext = adminSetup.context;
    mockOpusRepo = adminSetup.opusRepo;
    mockCompositionsRepo = adminSetup.compositionsRepo;

    const userSetup = createMockContext(false);
    userContext = userSetup.context;
  });

  describe('createOpus', () => {
    it('should throw UNAUTHENTICATED error when request is not authenticated', async () => {
      await expect(
        OpusMutation.createOpus({}, { input: BASE_CREATE_INPUT }, userContext)
      ).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code },
        })
      );
    });

    it('should throw error if opus with given number already exists', async () => {
      mockOpusRepo.findByNumber.mockResolvedValue(MOCK_OPUS_ENTITY);

      await expect(
        OpusMutation.createOpus({}, { input: BASE_CREATE_INPUT }, adminContext)
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.NUMBER_ALREADY_EXISTS(OPUS_NUMBER), {
          extensions: { code: 'DUPLICATE_OPUS_NUMBER' },
        })
      );

      expect(mockOpusRepo.findByNumber).toHaveBeenCalledWith(OPUS_NUMBER);
    });

    it('should throw error if nameForSlug is missing', async () => {
      mockOpusRepo.findByNumber.mockResolvedValue(null);

      await expect(
        OpusMutation.createOpus(
          {},
          { input: { ...BASE_CREATE_INPUT, name: { uk: '', en: '' } } },
          adminContext
        )
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.NAME_REQUIRED_FOR_SLUG, {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      );
    });

    it('should create opus with default parameters and sync compositions/images', async () => {
      mockOpusRepo.findByNumber.mockResolvedValue(null);
      mockedGenerateUniqueSlug.mockImplementation(async (_, options) => {
        if (options?.checkExists) {
          mockOpusRepo.findBySlug.mockResolvedValue(null);
          await options.checkExists(SLUG_VALUE);
        }
        return SLUG_VALUE;
      });
      mockCompositionsRepo.syncForOpus.mockResolvedValue([MOCK_COMPOSITION_1]);
      mockOpusRepo.create.mockResolvedValue(MOCK_OPUS_ENTITY);

      const coverImage = {
        src: 'img.png',
        alt: { uk: 'a', en: 'a' },
        crop: { x: 0, y: 0, width: 10, height: 10 },
      };

      const result = await OpusMutation.createOpus(
        {},
        {
          input: {
            ...BASE_CREATE_INPUT,
            coverImage,
            compositions: [
              {
                name: 'Comp 1',
                year: '2020',
                genre: 'Genre',
                notes: [
                  { name: 'Note 1', fileUrl: 'http://file.pdf', publishDate: '2020-01-01' },
                  { name: 'Note 2', fileUrl: '' },
                ],
                audios: [
                  { name: 'Audio 1', fileUrl: 'http://audio.mp3' },
                  { name: 'Audio 2', fileUrl: '' },
                ],
              },
            ],
          },
        },
        adminContext
      );

      expect(mockOpusRepo.findBySlug).toHaveBeenCalledWith(SLUG_VALUE);
      expect(mockCompositionsRepo.syncForOpus).toHaveBeenCalledWith([
        {
          id: undefined,
          name: { uk: 'Comp 1', en: 'Comp 1' },
          year: 2020,
          genre: 'Genre',
          audioAvailable: true,
          sheetAvailable: true,
          sheetMusic: [
            {
              url: 'http://file.pdf',
              name: 'Note 1',
              publishDate: '2020-01-01',
              isFree: true,
            },
          ],
          audios: [
            { name: 'Audio 1', url: 'http://audio.mp3' },
            { name: 'Audio 2', url: null },
          ],
        },
      ]);
      expect(mockOpusRepo.create).toHaveBeenCalledWith({
        number: OPUS_NUMBER,
        numberKind: 'op',
        title: BASE_CREATE_INPUT.title,
        name: BASE_CREATE_INPUT.name,
        description: BASE_CREATE_INPUT.description,
        additionalText: null,
        creationYear: CREATION_YEAR,
        endYear: null,
        datesNote: null,
        genre: null,
        adminTitle: null,
        slug: SLUG_VALUE,
        introDescription: null,
        parts: null,
        keywords: null,
        allowIndexation: null,
        coverImage,
        status: OpusStatus.Draft,
        publishedAt: null,
        meta: { views: 0 },
        compositions: [COMPOSITION_ID_1],
        blocksOrder: null
      });
      expect(mockOpusRepo.removeCompositionsFromCompositionsOpus).toHaveBeenCalledWith([
        COMPOSITION_ID_1,
      ]);
      expect(mockedSyncImagesCrops).toHaveBeenCalledWith(OPUS_ID, coverImage, {
        isCoverImage: true,
      });
      expect(mockedMarkImagesAsUsed).toHaveBeenCalledWith(
        adminContext.requestContainer.cradle.assetsRepository,
        null,
        coverImage,
        'opus',
        OPUS_ID
      );
      expect(result).toEqual({ ...MOCK_OPUS_ENTITY, compositions: [MOCK_COMPOSITION_1] });
    });

    it('should trim name.uk when generating slug and set status from input', async () => {
      mockOpusRepo.findByNumber.mockResolvedValue(null);
      mockedGenerateUniqueSlug.mockResolvedValue(SLUG_VALUE);
      mockCompositionsRepo.syncForOpus.mockResolvedValue([]);
      mockOpusRepo.create.mockResolvedValue(MOCK_OPUS_ENTITY);

      await OpusMutation.createOpus(
        {},
        {
          input: {
            ...BASE_CREATE_INPUT,
            name: { uk: '  Назва  ', en: 'Name' },
            status: OpusStatus.Published,
          },
        },
        adminContext
      );

      expect(mockedGenerateUniqueSlug).toHaveBeenCalledWith('Назва', expect.any(Object));
      expect(mockOpusRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: OpusStatus.Published,
        })
      );
      expect(mockedSyncImagesCrops).not.toHaveBeenCalled();
      expect(mockedMarkImagesAsUsed).not.toHaveBeenCalled();
    });
  });

  describe('updateOpusStatus', () => {
    it('should throw UNAUTHENTICATED error when request is not authenticated', async () => {
      await expect(
        OpusMutation.updateOpusStatus({}, { id: OPUS_ID, status: OpusStatus.Published }, userContext)
      ).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code },
        })
      );
    });

    it('should throw OPUS_NOT_FOUND if opus does not exist in repo', async () => {
      mockOpusRepo.findById.mockResolvedValue(null);

      await expect(
        OpusMutation.updateOpusStatus({}, { id: OPUS_ID, status: OpusStatus.Published }, adminContext)
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(OPUS_ID), {
          extensions: { code: 'OPUS_NOT_FOUND' },
        })
      );
    });

    it('should throw OPUS_NOT_FOUND if update operation returns null', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockOpusRepo.update.mockResolvedValue(null);

      await expect(
        OpusMutation.updateOpusStatus({}, { id: OPUS_ID, status: OpusStatus.Published }, adminContext)
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(OPUS_ID), {
          extensions: { code: 'OPUS_NOT_FOUND' },
        })
      );
    });

    it('should successfully update status', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockOpusRepo.update.mockResolvedValue({ ...MOCK_OPUS_ENTITY, status: OpusStatus.Published });

      const result = await OpusMutation.updateOpusStatus(
        {},
        { id: OPUS_ID, status: OpusStatus.Published },
        adminContext
      );

      expect(mockOpusRepo.update).toHaveBeenCalledWith(OPUS_ID, { status: OpusStatus.Published });
      expect(result).toEqual({ id: OPUS_ID, status: OpusStatus.Published });
    });
  });

  describe('updateOpus', () => {
    it('should throw UNAUTHENTICATED error when request is not authenticated', async () => {
      await expect(
        OpusMutation.updateOpus({}, { id: OPUS_ID, input: BASE_UPDATE_INPUT }, userContext)
      ).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code },
        })
      );
    });

    it('should throw OPUS_NOT_FOUND if existing opus is missing', async () => {
      mockOpusRepo.findById.mockResolvedValue(null);

      await expect(
        OpusMutation.updateOpus({}, { id: OPUS_ID, input: BASE_UPDATE_INPUT }, adminContext)
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(OPUS_ID), {
          extensions: { code: 'OPUS_NOT_FOUND' },
        })
      );
    });

    it('should throw duplicate error if number is changed and belongs to another opus', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockOpusRepo.findByNumber.mockResolvedValue({ ...MOCK_OPUS_ENTITY, id: OTHER_OPUS_ID });

      await expect(
        OpusMutation.updateOpus(
          {},
          { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, number: DUP_OPUS_NUMBER } },
          adminContext
        )
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.NUMBER_ALREADY_EXISTS(DUP_OPUS_NUMBER), {
          extensions: { code: 'DUPLICATE_OPUS_NUMBER' },
        })
      );
    });

    it('should keep compositions if input.compositions is undefined', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockCompositionsRepo.findByIds.mockResolvedValue([MOCK_COMPOSITION_1, MOCK_COMPOSITION_2]);
      mockedOrderCompositionsByIds.mockReturnValue([MOCK_COMPOSITION_1, MOCK_COMPOSITION_2]);
      mockOpusRepo.update.mockResolvedValue(MOCK_OPUS_ENTITY);

      const result = await OpusMutation.updateOpus(
        {},
        {
          id: OPUS_ID,
          input: { ...BASE_UPDATE_INPUT, title: { uk: 'Нев', en: 'New' } },
        },
        adminContext
      );

      expect(mockCompositionsRepo.findByIds).toHaveBeenCalledWith([
        COMPOSITION_ID_1,
        COMPOSITION_ID_2,
      ]);
      expect(mockedOrderCompositionsByIds).toHaveBeenCalledWith(
        [COMPOSITION_ID_1, COMPOSITION_ID_2],
        [MOCK_COMPOSITION_1, MOCK_COMPOSITION_2]
      );
      expect(mockOpusRepo.update).toHaveBeenCalledWith(OPUS_ID, {
        number: OPUS_NUMBER,
        numberKind: 'op',
        name: BASE_UPDATE_INPUT.name,
        creationYear: CREATION_YEAR,
        title: { uk: 'Нев', en: 'New' },
        compositions: [COMPOSITION_ID_1, COMPOSITION_ID_2],
      });
      expect(result).toEqual({ ...MOCK_OPUS_ENTITY, compositions: [MOCK_COMPOSITION_1, MOCK_COMPOSITION_2] });
    });

    it('should process compositions changes (added and removed) correctly', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockCompositionsRepo.syncForOpus.mockResolvedValue([MOCK_COMPOSITION_2, MOCK_COMPOSITION_3]);
      mockOpusRepo.update.mockResolvedValue(MOCK_OPUS_ENTITY);

      const nameInput = { uk: 'Оновлено', en: 'Updated' };

      await OpusMutation.updateOpus(
        {},
        {
          id: OPUS_ID,
          input: {
            ...BASE_UPDATE_INPUT,
            name: nameInput,
            compositions: [{ name: 'Comp 2' }, { name: 'Comp 3' }],
          },
        },
        adminContext
      );

      expect(mockedProcessSlugUpdate).toHaveBeenCalledWith(
        OPUS_ID,
        nameInput,
        mockOpusRepo,
        expect.any(Object)
      );
      expect(mockOpusRepo.removeCompositionsFromCompositionsOpus).toHaveBeenCalledWith([
        COMPOSITION_ID_3,
      ]);
      expect(mockOpusRepo.moveCompositionsToCompositionsOpus).toHaveBeenCalledWith([
        COMPOSITION_ID_1,
      ]);
    });

    it('should throw OPUS_NOT_FOUND when update returns null', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockCompositionsRepo.findByIds.mockResolvedValue([]);
      mockedOrderCompositionsByIds.mockReturnValue([]);
      mockOpusRepo.update.mockResolvedValue(null);

      await expect(
        OpusMutation.updateOpus({}, { id: OPUS_ID, input: BASE_UPDATE_INPUT }, adminContext)
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(OPUS_ID), {
          extensions: { code: 'OPUS_NOT_FOUND' },
        })
      );
    });

    it('should sync crops and mark images as used when coverImage is updated', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockCompositionsRepo.findByIds.mockResolvedValue([]);
      mockedOrderCompositionsByIds.mockReturnValue([]);
      mockOpusRepo.update.mockResolvedValue(MOCK_OPUS_ENTITY);

      const coverImage = {
        src: 'img.jpg',
        alt: { uk: 'a', en: 'a' },
        crop: { x: 0, y: 0, width: 5, height: 5 },
      };

      await OpusMutation.updateOpus(
        {},
        { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, coverImage } },
        adminContext
      );

      expect(mockedSyncImagesCrops).toHaveBeenCalledWith(OPUS_ID, coverImage, {
        isCoverImage: true,
      });
      expect(mockedMarkImagesAsUsed).toHaveBeenCalledWith(
        adminContext.requestContainer.cradle.assetsRepository,
        null,
        coverImage,
        'opus',
        OPUS_ID
      );
    });
  });

  describe('deleteOpus', () => {
    it('should throw UNAUTHENTICATED error when request is not authenticated', async () => {
      await expect(OpusMutation.deleteOpus({}, { id: OPUS_ID }, userContext)).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code },
        })
      );
    });

    it('should unlink opus and delete it from repository', async () => {
      mockOpusRepo.unlink.mockResolvedValue(undefined);
      mockOpusRepo.delete.mockResolvedValue(true);

      const result = await OpusMutation.deleteOpus({}, { id: OPUS_ID }, adminContext);

      expect(mockOpusRepo.unlink).toHaveBeenCalledWith(OPUS_ID);
      expect(mockOpusRepo.delete).toHaveBeenCalledWith(OPUS_ID);
      expect(result).toBe(true);
    });
  });
});
