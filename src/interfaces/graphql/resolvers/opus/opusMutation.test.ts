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
jest.mock('~/src/infrastructure/repositories/helpers', () => ({
  withTransaction: jest.fn(async (callback: (session: object) => Promise<unknown>) => callback({}))
}));

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
  compositions: [COMPOSITION_ID_1, COMPOSITION_ID_2]
} as unknown as Opus;

const MOCK_COMPOSITION_1 = { id: COMPOSITION_ID_1 } as Composition;
const MOCK_COMPOSITION_2 = { id: COMPOSITION_ID_2 } as Composition;
const MOCK_COMPOSITION_3 = { id: COMPOSITION_ID_3 } as Composition;

describe('OpusMutation Resolvers', () => {
  let mockOpusRepo: jest.Mocked<IOpusRepository>;
  let mockCompositionsRepo: jest.Mocked<ICompositionRepository>;
  let adminContext: GraphQLContext;
  let userContext: GraphQLContext;

  const createMockContext = (
    isAdmin: boolean
  ): {
    context: GraphQLContext;
    opusRepo: jest.Mocked<IOpusRepository>;
    compositionsRepo: jest.Mocked<ICompositionRepository>;
  } => {
    const opusRepo = {
      findById: jest.fn(),
      findByComplexKey: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      findPaginated: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      unlink: jest.fn(),
      removeCompositionsFromCompositionsOpus: jest.fn(),
      moveCompositionsToCompositionsOpus: jest.fn()
    } as unknown as jest.Mocked<IOpusRepository>;

    const compositionsRepo = {
      findByOpusId: jest.fn(),
      findByOpusIds: jest.fn(),
      findByNumber: jest.fn(),
      findByIds: jest.fn(),
      findByName: jest.fn(),
      syncForOpus: jest.fn().mockResolvedValue([]),
      deleteByOpusId: jest.fn(),
      searchByTitle: jest.fn()
    } as unknown as jest.Mocked<ICompositionRepository>;

    const context = {
      admin: isAdmin,
      requestContainer: {
        cradle: {
          opusRepository: opusRepo,
          compositionsRepository: compositionsRepo,
          assetsRepository: {}
        }
      }
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
      await expect(OpusMutation.createOpus({}, { input: BASE_CREATE_INPUT }, userContext)).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );
      expect(mockOpusRepo.create).not.toHaveBeenCalled();
    });

    it('should throw error if opus with given number already exists', async () => {
      mockOpusRepo.findByComplexKey.mockResolvedValue(MOCK_OPUS_ENTITY);

      await expect(OpusMutation.createOpus({}, { input: BASE_CREATE_INPUT }, adminContext)).rejects.toThrow(
        new GraphQLError(opusServiceErrors.OPUS_ALREADY_EXISTS, {
          extensions: { code: 'DUPLICATE_OPUS_NUMBER' }
        })
      );

      expect(mockOpusRepo.findByComplexKey).toHaveBeenCalledWith(OPUS_NUMBER, 'op', null);
    });

    it('should translate a duplicate-key race from the repository', async () => {
      mockOpusRepo.findByComplexKey.mockResolvedValue(null);
      mockedGenerateUniqueSlug.mockResolvedValue(SLUG_VALUE);
      mockOpusRepo.create.mockRejectedValue(new Error(opusServiceErrors.OPUS_ALREADY_EXISTS));

      await expect(OpusMutation.createOpus({}, { input: BASE_CREATE_INPUT }, adminContext)).rejects.toThrow(
        new GraphQLError(opusServiceErrors.OPUS_ALREADY_EXISTS, {
          extensions: { code: 'DUPLICATE_OPUS_NUMBER' }
        })
      );
    });

    it('should throw error if name is missing or invalid length', async () => {
      mockOpusRepo.findByComplexKey.mockResolvedValue(null);
      await expect(
        OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, name: { uk: '', en: '' } } }, adminContext)
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.NAME_LENGTH_INVALID, {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      );
    });

    it('should create opus with default parameters and sync compositions/images', async () => {
      mockOpusRepo.findByComplexKey.mockResolvedValue(null);
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
        crop: { x: 0, y: 0, width: 10, height: 10 }
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
                  { name: 'Note 2', fileUrl: '' }
                ],
                audios: [
                  { name: 'Audio 1', fileUrl: 'http://audio.mp3' },
                  { name: 'Audio 2', fileUrl: '' }
                ]
              }
            ]
          }
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
              isFree: true
            }
          ],
          audios: [
            { name: 'Audio 1', url: 'http://audio.mp3' },
            { name: 'Audio 2', url: null }
          ]
        }
      ], expect.anything());
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
      }, expect.anything());
      expect(mockOpusRepo.removeCompositionsFromCompositionsOpus).toHaveBeenCalledWith([COMPOSITION_ID_1], expect.anything());
      expect(mockedSyncImagesCrops).toHaveBeenCalledWith(OPUS_ID, coverImage, {
        isCoverImage: true
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

    it('should reject an empty composition name before syncing', async () => {
      mockOpusRepo.findByComplexKey.mockResolvedValue(null);

      await expect(
        OpusMutation.createOpus(
          {},
          { input: { ...BASE_CREATE_INPUT, compositions: [{ name: '   ' }] } },
          adminContext
        )
      ).rejects.toMatchObject({
        message: 'Composition name is required',
        extensions: { code: 'BAD_USER_INPUT' }
      });
      expect(mockCompositionsRepo.syncForOpus).not.toHaveBeenCalled();
    });

    it('should reject duplicate names submitted in one opus', async () => {
      mockOpusRepo.findByComplexKey.mockResolvedValue(null);

      await expect(
        OpusMutation.createOpus(
          {},
          { input: { ...BASE_CREATE_INPUT, compositions: [{ name: 'Sonata' }, { name: ' sonata ' }] } },
          adminContext
        )
      ).rejects.toMatchObject({ extensions: { code: 'COMPOSITION_NAME_TAKEN' } });
    });

    it('should translate a duplicate-key error from composition synchronization', async () => {
      mockOpusRepo.findByComplexKey.mockResolvedValue(null);
      mockedGenerateUniqueSlug.mockResolvedValue(SLUG_VALUE);
      mockCompositionsRepo.syncForOpus.mockRejectedValue({ code: 11000, keyValue: { 'name.uk': 'Sonata' } });

      await expect(
        OpusMutation.createOpus(
          {},
          { input: { ...BASE_CREATE_INPUT, compositions: [{ name: 'Sonata' }] } },
          adminContext
        )
      ).rejects.toMatchObject({
        message: 'Композиція "Sonata" вже існує',
        extensions: { code: 'COMPOSITION_NAME_TAKEN' }
      });
    });

    it('should trim name.uk when generating slug and set status from input', async () => {
      mockOpusRepo.findByComplexKey.mockResolvedValue(null);
      mockedGenerateUniqueSlug.mockResolvedValue(SLUG_VALUE);
      mockCompositionsRepo.syncForOpus.mockResolvedValue([]);
      mockOpusRepo.create.mockResolvedValue(MOCK_OPUS_ENTITY);

      await OpusMutation.createOpus(
        {},
        {
          input: {
            ...BASE_CREATE_INPUT,
            name: { uk: '   Назва   ', en: 'Name' },
            status: OpusStatus.Published
          }
        },
        adminContext
      );

      expect(mockedGenerateUniqueSlug).toHaveBeenCalledWith('Назва', expect.any(Object));
      expect(mockOpusRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: OpusStatus.Published
        }),
        expect.anything()
      );
      expect(mockedSyncImagesCrops).not.toHaveBeenCalled();
      expect(mockedMarkImagesAsUsed).not.toHaveBeenCalled();
    });

    describe('Field Validations (createOpus)', () => {
      it('should throw error if number is negative', async () => {
        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, number: -1 } }, adminContext)
        ).rejects.toThrow(opusServiceErrors.NUMBER_NOT_NEGATIVE);
      });

      it('should throw error if additionalText is too long', async () => {
        const longText = 'a'.repeat(41);
        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, additionalText: longText } }, adminContext)
        ).rejects.toThrow(opusServiceErrors.ADDITIONAL_TEXT_TOO_LONG);
      });

      it('should throw error if creationYear is missing or empty', async () => {
        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, creationYear: '   ' } }, adminContext)
        ).rejects.toThrow(opusServiceErrors.CREATION_YEAR_REQUIRED);
      });

      it('should throw error if creationYear is invalid or out of bounds', async () => {
        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, creationYear: '1899' } }, adminContext)
        ).rejects.toThrow(opusServiceErrors.CREATION_YEAR_INVALID);

        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, creationYear: 'abc' } }, adminContext)
        ).rejects.toThrow(opusServiceErrors.CREATION_YEAR_INVALID);
      });

      it('should throw error if datesNote is too long', async () => {
        const longText = 'a'.repeat(41);
        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, datesNote: longText } }, adminContext)
        ).rejects.toThrow(opusServiceErrors.DATES_NOTE_TOO_LONG);
      });

      it('should throw error if genre is too long', async () => {
        const longGenre = 'a'.repeat(251);
        await expect(
          OpusMutation.createOpus(
            {},
            { input: { ...BASE_CREATE_INPUT, genre: { uk: longGenre, en: '' } } },
            adminContext
          )
        ).rejects.toThrow(opusServiceErrors.GENRE_TOO_LONG);
      });

      it('should throw error if genre.en is too long (with valid or empty uk)', async () => {
        const longGenre = 'a'.repeat(251);
        await expect(
          OpusMutation.createOpus(
            {},
            { input: { ...BASE_CREATE_INPUT, genre: { uk: 'valid', en: longGenre } } },
            adminContext
          )
        ).rejects.toThrow(opusServiceErrors.GENRE_TOO_LONG);

        await expect(
          OpusMutation.createOpus(
            {},
            { input: { ...BASE_CREATE_INPUT, genre: { uk: '', en: longGenre } } },
            adminContext
          )
        ).rejects.toThrow(opusServiceErrors.GENRE_TOO_LONG);
      });
    });

    describe('Gallery and Performances Validation', () => {
      it('should throw error if gallery exceeds 20 items', async () => {
        const gallery = Array.from({ length: 21 }, (_, i) => ({
          src: `img${i}.jpg`,
          altText: { uk: 'alt', en: 'alt' }
        }));

        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, gallery } as any }, adminContext)
        ).rejects.toThrow(opusServiceErrors.GALLERY_TOO_MANY_PHOTOS);
      });

      it('should throw error if gallery altText is missing or too short', async () => {
        const gallery = [{ src: 'img.jpg', altText: { uk: '1', en: 'valid alt' } }];

        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, gallery } as any }, adminContext)
        ).rejects.toThrow(opusServiceErrors.GALLERY_ALT_TEXT_REQUIRED);
      });

      it('should throw error if gallery description is provided but too short', async () => {
        const gallery = [
          {
            src: 'img.jpg',
            altText: { uk: 'valid alt', en: 'valid alt' },
            description: { uk: 'X', en: '' }
          }
        ];

        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, gallery } as any }, adminContext)
        ).rejects.toThrow(opusServiceErrors.GALLERY_DESCRIPTION_INVALID);
      });

      it('should throw error if performances exceed 5 items', async () => {
        const performances = Array.from({ length: 6 }, () => ({
          videoUrl: 'https://youtube.com',
          title: { uk: 'ua title', en: 'en title' }
        }));

        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, performances } as any }, adminContext)
        ).rejects.toThrow(opusServiceErrors.PERFORMANCES_TOO_MANY);
      });

      it('should throw error if performance videoUrl is missing', async () => {
        const performances = [{ videoUrl: '', title: { uk: 'ua title', en: 'en title' } }];

        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, performances } as any }, adminContext)
        ).rejects.toThrow(opusServiceErrors.PERFORMANCES_URL_REQUIRED);
      });

      it('should throw error if performance title is too short', async () => {
        const performances = [{ videoUrl: 'https://youtube.com', title: { uk: 'a', en: 'valid title' } }];

        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, performances } as any }, adminContext)
        ).rejects.toThrow(opusServiceErrors.PERFORMANCES_TITLE_INVALID);
      });

      it('should throw error if gallery description uk is too long', async () => {
        const gallery = [
          {
            src: 'img.jpg',
            altText: { uk: 'valid alt', en: 'valid alt' },
            description: { uk: 'a'.repeat(251), en: '' }
          }
        ];
        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, gallery } as any }, adminContext)
        ).rejects.toThrow(opusServiceErrors.GALLERY_DESCRIPTION_INVALID);
      });

      it('should throw error if gallery description en is too short or too long', async () => {
        const galleryShort = [
          { src: 'img.jpg', altText: { uk: 'valid', en: 'valid' }, description: { uk: '', en: 'a' } }
        ];
        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, gallery: galleryShort } as any }, adminContext)
        ).rejects.toThrow(opusServiceErrors.GALLERY_DESCRIPTION_INVALID);

        const galleryLong = [
          { src: 'img.jpg', altText: { uk: 'valid', en: 'valid' }, description: { uk: 'valid', en: 'a'.repeat(251) } }
        ];
        await expect(
          OpusMutation.createOpus({}, { input: { ...BASE_CREATE_INPUT, gallery: galleryLong } as any }, adminContext)
        ).rejects.toThrow(opusServiceErrors.GALLERY_DESCRIPTION_INVALID);
      });
    });
  });

  describe('updateOpusStatus', () => {
    it('should throw UNAUTHENTICATED error when request is not authenticated', async () => {
      await expect(
        OpusMutation.updateOpusStatus({}, { id: OPUS_ID, status: OpusStatus.Published }, userContext)
      ).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );
      expect(mockOpusRepo.update).not.toHaveBeenCalled();
    });

    it('should throw OPUS_NOT_FOUND if opus does not exist in repo', async () => {
      mockOpusRepo.findById.mockResolvedValue(null);

      await expect(
        OpusMutation.updateOpusStatus({}, { id: OPUS_ID, status: OpusStatus.Published }, adminContext)
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(OPUS_ID), {
          extensions: { code: 'OPUS_NOT_FOUND' }
        })
      );
      expect(mockOpusRepo.findById).toHaveBeenCalledWith(OPUS_ID);
      expect(mockOpusRepo.update).not.toHaveBeenCalled();
    });

    it('should throw OPUS_NOT_FOUND if update operation returns null', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockOpusRepo.update.mockResolvedValue(null);

      await expect(
        OpusMutation.updateOpusStatus({}, { id: OPUS_ID, status: OpusStatus.Published }, adminContext)
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(OPUS_ID), {
          extensions: { code: 'OPUS_NOT_FOUND' }
        })
      );
      expect(mockOpusRepo.findById).toHaveBeenCalledWith(OPUS_ID);
      expect(mockOpusRepo.update).toHaveBeenCalledWith(OPUS_ID, { status: OpusStatus.Published });
    });

    it('should successfully update status', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockOpusRepo.update.mockResolvedValue({ ...MOCK_OPUS_ENTITY, status: OpusStatus.Published });

      const result = await OpusMutation.updateOpusStatus(
        {},
        { id: OPUS_ID, status: OpusStatus.Published },
        adminContext
      );

      expect(mockOpusRepo.findById).toHaveBeenCalledWith(OPUS_ID);
      expect(mockOpusRepo.update).toHaveBeenCalledWith(OPUS_ID, { status: OpusStatus.Published });
      expect(result).toEqual({ id: OPUS_ID, status: OpusStatus.Published });
    });
  });

  describe('updateOpus', () => {
    it('should throw UNAUTHENTICATED error when request is not authenticated', async () => {
      await expect(OpusMutation.updateOpus({}, { id: OPUS_ID, input: BASE_UPDATE_INPUT }, userContext)).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );
      expect(mockOpusRepo.update).not.toHaveBeenCalled();
    });

    it('should throw OPUS_NOT_FOUND if existing opus is missing', async () => {
      mockOpusRepo.findById.mockResolvedValue(null);

      await expect(
        OpusMutation.updateOpus({}, { id: OPUS_ID, input: BASE_UPDATE_INPUT }, adminContext)
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(OPUS_ID), {
          extensions: { code: 'OPUS_NOT_FOUND' }
        })
      );
      expect(mockOpusRepo.findById).toHaveBeenCalledWith(OPUS_ID);
      expect(mockOpusRepo.update).not.toHaveBeenCalled();
    });

    it('should throw duplicate error if number is changed and belongs to another opus', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockOpusRepo.findByComplexKey.mockResolvedValue({ ...MOCK_OPUS_ENTITY, id: OTHER_OPUS_ID });

      await expect(
        OpusMutation.updateOpus(
          {},
          { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, number: DUP_OPUS_NUMBER } },
          adminContext
        )
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.OPUS_ALREADY_EXISTS, {
          extensions: { code: 'DUPLICATE_OPUS_NUMBER' }
        })
      );
      expect(mockOpusRepo.findByComplexKey).toHaveBeenCalledWith(DUP_OPUS_NUMBER, 'op', null);
      expect(mockOpusRepo.update).not.toHaveBeenCalled();
    });

    it('should keep compositions if input.compositions is undefined', async () => {
      const existingOpus = { ...MOCK_OPUS_ENTITY, additionalText: 'bis' };
      mockOpusRepo.findById.mockResolvedValue(existingOpus);
      mockCompositionsRepo.findByIds.mockResolvedValue([MOCK_COMPOSITION_1, MOCK_COMPOSITION_2]);
      mockedOrderCompositionsByIds.mockReturnValue([MOCK_COMPOSITION_1, MOCK_COMPOSITION_2]);
      mockOpusRepo.update.mockResolvedValue(MOCK_OPUS_ENTITY);

      const result = await OpusMutation.updateOpus(
        {},
        {
          id: OPUS_ID,
          input: { ...BASE_UPDATE_INPUT, title: { uk: 'Нев', en: 'New' } }
        },
        adminContext
      );

      expect(mockCompositionsRepo.findByIds).toHaveBeenCalledWith([COMPOSITION_ID_1, COMPOSITION_ID_2], expect.anything());
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
        compositions: [COMPOSITION_ID_1, COMPOSITION_ID_2]
      }, expect.anything());
      expect(result).toEqual({ ...MOCK_OPUS_ENTITY, compositions: [MOCK_COMPOSITION_1, MOCK_COMPOSITION_2] });
    });

    it('should translate a duplicate-key race from the repository', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockOpusRepo.findByComplexKey.mockResolvedValue(null);
      mockCompositionsRepo.findByIds.mockResolvedValue([]);
      mockedOrderCompositionsByIds.mockReturnValue([]);
      mockOpusRepo.update.mockRejectedValue(new Error(opusServiceErrors.OPUS_ALREADY_EXISTS));

      await expect(
        OpusMutation.updateOpus({}, { id: OPUS_ID, input: BASE_UPDATE_INPUT }, adminContext)
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.OPUS_ALREADY_EXISTS, {
          extensions: { code: 'DUPLICATE_OPUS_NUMBER' }
        })
      );
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
            compositions: [{ name: 'Comp 2' }, { name: 'Comp 3' }]
          }
        },
        adminContext
      );

      expect(mockedProcessSlugUpdate).toHaveBeenCalledWith(OPUS_ID, nameInput, mockOpusRepo, expect.any(Object), expect.anything());
      expect(mockOpusRepo.removeCompositionsFromCompositionsOpus).toHaveBeenCalledWith([COMPOSITION_ID_3], expect.anything());
      expect(mockOpusRepo.moveCompositionsToCompositionsOpus).toHaveBeenCalledWith([COMPOSITION_ID_1], expect.anything());
    });

    it('should reject a composition name already used by another composition on update', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockCompositionsRepo.findByName.mockResolvedValue({ ...MOCK_COMPOSITION_1, id: OTHER_OPUS_ID });

      await expect(
        OpusMutation.updateOpus(
          {},
          { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, compositions: [{ name: 'Taken' }] } },
          adminContext
        )
      ).rejects.toMatchObject({ extensions: { code: 'COMPOSITION_NAME_TAKEN' } });
      expect(mockCompositionsRepo.syncForOpus).not.toHaveBeenCalled();
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
          extensions: { code: 'OPUS_NOT_FOUND' }
        })
      );
      expect(mockOpusRepo.update).toHaveBeenCalled();
    });

    it('should sync crops and mark images as used when coverImage is updated', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockCompositionsRepo.findByIds.mockResolvedValue([]);
      mockedOrderCompositionsByIds.mockReturnValue([]);
      mockOpusRepo.update.mockResolvedValue(MOCK_OPUS_ENTITY);

      const coverImage = {
        src: 'img.jpg',
        alt: { uk: 'a', en: 'a' },
        crop: { x: 0, y: 0, width: 5, height: 5 }
      };

      await OpusMutation.updateOpus({}, { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, coverImage } }, adminContext);

      expect(mockedSyncImagesCrops).toHaveBeenCalledWith(OPUS_ID, coverImage, {
        isCoverImage: true
      });
      expect(mockedMarkImagesAsUsed).toHaveBeenCalledWith(
        adminContext.requestContainer.cradle.assetsRepository,
        null,
        coverImage,
        'opus',
        OPUS_ID
      );
    });

    it('should explicitly validate and update performances', async () => {
      mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockOpusRepo.update.mockResolvedValue(MOCK_OPUS_ENTITY);
      mockCompositionsRepo.syncForOpus.mockResolvedValue([]);

      const performances = [{ videoUrl: 'https://youtube.com/watch?v=123', title: { uk: 'Valid UA', en: 'Valid EN' } }];

      await OpusMutation.updateOpus(
        {},
        { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, performances } as any },
        adminContext
      );

      expect(mockOpusRepo.update).toHaveBeenCalledWith(OPUS_ID, expect.objectContaining({ performances }), expect.anything());
    });

    describe('Field Validations (updateOpus)', () => {
      it('should throw error if number is negative', async () => {
        await expect(
          OpusMutation.updateOpus({}, { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, number: -1 } }, adminContext)
        ).rejects.toThrow(opusServiceErrors.NUMBER_NOT_NEGATIVE);
      });

      it('should throw error if additionalText is too long', async () => {
        const longText = 'a'.repeat(41);
        await expect(
          OpusMutation.updateOpus(
            {},
            { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, additionalText: longText } },
            adminContext
          )
        ).rejects.toThrow(opusServiceErrors.ADDITIONAL_TEXT_TOO_LONG);
      });

      it('should throw error if creationYear is missing or empty', async () => {
        await expect(
          OpusMutation.updateOpus(
            {},
            { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, creationYear: '   ' } },
            adminContext
          )
        ).rejects.toThrow(opusServiceErrors.CREATION_YEAR_REQUIRED);
      });

      it('should throw error if creationYear is invalid or out of bounds', async () => {
        await expect(
          OpusMutation.updateOpus(
            {},
            { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, creationYear: '2101' } },
            adminContext
          )
        ).rejects.toThrow(opusServiceErrors.CREATION_YEAR_INVALID);
      });

      it('should throw error if datesNote is too long', async () => {
        const longText = 'a'.repeat(41);
        await expect(
          OpusMutation.updateOpus(
            {},
            { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, datesNote: longText } },
            adminContext
          )
        ).rejects.toThrow(opusServiceErrors.DATES_NOTE_TOO_LONG);
      });

      it('should throw error if genre is too long', async () => {
        const longGenre = 'a'.repeat(251);
        await expect(
          OpusMutation.updateOpus(
            {},
            { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, genre: { uk: '', en: longGenre } } },
            adminContext
          )
        ).rejects.toThrow(opusServiceErrors.GENRE_TOO_LONG);
      });

      it('should throw error if genre.uk is too long', async () => {
        const longGenre = 'a'.repeat(251);
        await expect(
          OpusMutation.updateOpus(
            {},
            { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, genre: { uk: longGenre, en: '' } } },
            adminContext
          )
        ).rejects.toThrow(opusServiceErrors.GENRE_TOO_LONG);
      });

      it('should throw error if genre.en is too long (with valid or empty uk)', async () => {
        const longGenre = 'a'.repeat(251);
        await expect(
          OpusMutation.updateOpus(
            {},
            { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, genre: { uk: 'valid', en: longGenre } } },
            adminContext
          )
        ).rejects.toThrow(opusServiceErrors.GENRE_TOO_LONG);

        await expect(
          OpusMutation.updateOpus(
            {},
            { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, genre: { uk: '', en: longGenre } } },
            adminContext
          )
        ).rejects.toThrow(opusServiceErrors.GENRE_TOO_LONG);
      });
    });

    describe('Edge Cases (Parsers & Helpers)', () => {
      it('should map compositions gracefully ignoring invalid years and filtering empty files', async () => {
        mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
        mockOpusRepo.update.mockResolvedValue(MOCK_OPUS_ENTITY);
        mockCompositionsRepo.syncForOpus.mockResolvedValue([]);

        await OpusMutation.updateOpus(
          {},
          {
            id: OPUS_ID,
            input: {
              ...BASE_UPDATE_INPUT,
              compositions: [
                {
                  name: 'Test',
                  year: 'invalid-year',
                  genre: null,
                  notes: [{ name: 'Empty note', fileUrl: '' }],
                  audios: [{ name: '', fileUrl: '' }]
                }
              ]
            }
          },
          adminContext
        );

        expect(mockCompositionsRepo.syncForOpus).toHaveBeenCalledWith([
          expect.objectContaining({
            year: null,
            sheetMusic: [],
            audios: []
          })
        ], expect.anything());
      });

      it('should skip gallery item validation if src is empty', async () => {
        mockOpusRepo.findById.mockResolvedValue(MOCK_OPUS_ENTITY);
        mockOpusRepo.update.mockResolvedValue(MOCK_OPUS_ENTITY);
        mockCompositionsRepo.syncForOpus.mockResolvedValue([]);

        const gallery = [{ src: '   ', altText: { uk: 'a', en: 'a' } }];

        const result = await OpusMutation.updateOpus(
          {},
          { id: OPUS_ID, input: { ...BASE_UPDATE_INPUT, gallery } as any },
          adminContext
        );
        expect(result).toBeDefined();
      });
    });
  });

  describe('deleteOpus', () => {
    it('should throw UNAUTHENTICATED error when request is not authenticated', async () => {
      await expect(OpusMutation.deleteOpus({}, { id: OPUS_ID }, userContext)).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );
      expect(mockOpusRepo.unlink).not.toHaveBeenCalled();
      expect(mockOpusRepo.delete).not.toHaveBeenCalled();
    });

    it('should unlink opus and delete it from repository', async () => {
      mockOpusRepo.unlink.mockResolvedValue(undefined);
      mockOpusRepo.delete.mockResolvedValue(true);

      const result = await OpusMutation.deleteOpus({}, { id: OPUS_ID }, adminContext);

      expect(mockOpusRepo.unlink).toHaveBeenCalledWith(OPUS_ID, expect.anything());
      expect(mockOpusRepo.delete).toHaveBeenCalledWith(OPUS_ID, expect.anything());
      expect(result).toBe(true);
    });
  });

  describe('unlinkComposition', () => {
    it('should throw UNAUTHENTICATED error when request is not authenticated', async () => {
      await expect(
        OpusMutation.unlinkComposition({}, { opusId: OPUS_ID, compositionId: COMPOSITION_ID_1 }, userContext)
      ).rejects.toThrow(
        new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        })
      );
    });

    it('should throw OPUS_NOT_FOUND if opus does not exist', async () => {
      mockOpusRepo.findById.mockResolvedValue(null);

      await expect(
        OpusMutation.unlinkComposition({}, { opusId: OPUS_ID, compositionId: COMPOSITION_ID_1 }, adminContext)
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.OPUS_NOT_FOUND(OPUS_ID), {
          extensions: { code: 'OPUS_NOT_FOUND' }
        })
      );
    });

    it('should throw COMPOSITION_NOT_FOUND_IN_OPUS error if composition is not linked to the opus', async () => {
      const opusWithoutComp = {
        ...MOCK_OPUS_ENTITY,
        compositions: [COMPOSITION_ID_2]
      };
      mockOpusRepo.findById.mockResolvedValue(opusWithoutComp as unknown as Opus);

      await expect(
        OpusMutation.unlinkComposition({}, { opusId: OPUS_ID, compositionId: COMPOSITION_ID_1 }, adminContext)
      ).rejects.toThrow(
        new GraphQLError(opusServiceErrors.COMPOSITION_NOT_FOUND_IN_OPUS, {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      );
    });

    it('should successfully unlink composition, update opus, move composition, and return ordered compositions', async () => {
      const initialOpus = {
        ...MOCK_OPUS_ENTITY,
        compositions: [COMPOSITION_ID_1, COMPOSITION_ID_2]
      };
      const updatedOpusEntity = {
        ...MOCK_OPUS_ENTITY,
        compositions: [COMPOSITION_ID_2]
      };

      mockOpusRepo.findById.mockResolvedValue(initialOpus as unknown as Opus);
      mockOpusRepo.update.mockResolvedValue(updatedOpusEntity as unknown as Opus);
      mockOpusRepo.moveCompositionsToCompositionsOpus.mockResolvedValue(undefined as never);
      mockCompositionsRepo.findByIds.mockResolvedValue([MOCK_COMPOSITION_2]);
      mockedOrderCompositionsByIds.mockReturnValue([MOCK_COMPOSITION_2]);

      const result = await OpusMutation.unlinkComposition(
        {},
        { opusId: OPUS_ID, compositionId: COMPOSITION_ID_1 },
        adminContext
      );

      expect(mockOpusRepo.findById).toHaveBeenCalledWith(OPUS_ID);
      expect(mockOpusRepo.update).toHaveBeenCalledWith(OPUS_ID, {
        compositions: [COMPOSITION_ID_2]
      }, expect.anything());
      expect(mockOpusRepo.moveCompositionsToCompositionsOpus).toHaveBeenCalledWith([COMPOSITION_ID_1], expect.anything());
      expect(mockCompositionsRepo.findByIds).toHaveBeenCalledWith([COMPOSITION_ID_2], expect.anything());
      expect(mockedOrderCompositionsByIds).toHaveBeenCalledWith([COMPOSITION_ID_2], [MOCK_COMPOSITION_2]);
      expect(result).toEqual({ ...updatedOpusEntity, compositions: [MOCK_COMPOSITION_2] });
    });

    it.each([undefined, null])(
      'should handle %s opus.compositions gracefully and throw error when composition is not found',
      async (compositionsValue) => {
        const opusWithoutCompositions = {
          ...MOCK_OPUS_ENTITY,
          compositions: compositionsValue as unknown as string[]
        };

        mockOpusRepo.findById.mockResolvedValue(opusWithoutCompositions as unknown as Opus);

        await expect(
          OpusMutation.unlinkComposition(
            {},
            { opusId: OPUS_ID, compositionId: COMPOSITION_ID_1 },
            adminContext
          )
        ).rejects.toThrow(
          new GraphQLError(opusServiceErrors.COMPOSITION_NOT_FOUND_IN_OPUS, {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        );
      }
    );
  });
});
