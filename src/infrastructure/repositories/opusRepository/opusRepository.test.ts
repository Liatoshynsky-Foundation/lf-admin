import { Model } from 'mongoose';

import { buildBaseQuery } from '../helpers';
import { DbOpus, OpusRepository } from './opusRepository';
import { CreateOpusInput, IOpusRepository } from '~/domain/repositories/opusRepository';
import { opusServiceErrors } from '~/src/constants/errors';
import { OpusStatus, SortOrder } from '~/types/enums/common.enums';
import { OpusNumberKind } from '~/types/graphql/generated/graphql';

jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
  Types: {
    ObjectId: {
      isValid: (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id)
    }
  }
}));

jest.mock('~/src/infrastructure/db/connect', () => jest.fn());

jest.mock('~/infrastructure/repositories/helpers', () => {
  const originalModule = jest.requireActual('~/infrastructure/repositories/helpers') as Record<string, unknown>;
  return {
    ...originalModule,
    buildBaseQuery: jest.fn().mockImplementation((filters: unknown) => (originalModule['buildBaseQuery'] as (f: unknown) => unknown)(filters)),
  };
});

const MOCK_ID = '65eddf5e2f1a2b3c4d5e6f7a';
const OPUS_NUMBER_1 = 1;
const OPUS_NUMBER_2 = 2;
const MOCK_TITLE_UK = 'Опус';
const MOCK_TITLE_EN = 'Opus';
const MOCK_NAME_UK = 'Перший струнний квартет';
const MOCK_NAME_EN = 'First string quartet';
const MOCK_CREATION_YEAR = '1922';
const MOCK_GENRE = 'Струнний квартет';
const MOCK_SLUG = 'opus-1';
const MOCK_DATE = '2026-03-10T10:00:00.000Z';
const MOCK_UPDATED_DATE = '2026-03-11T12:00:00.000Z';
const MOCK_PUBLISHED_DATE = '2026-01-01T00:00:00.000Z';
const MOCK_YOUTUBE_URL_1 = 'https://youtube.com/watch?v=1';
const MOCK_YOUTUBE_URL_2 = 'https://youtube.com/watch?v=2';
const LOOSE_OPUS_ID = 'loose-opus-id';

const createMockOpusDoc = (overrides: Partial<DbOpus> = {}): DbOpus => ({
  _id: { toString: (): string => MOCK_ID },
  number: OPUS_NUMBER_1,
  title: { uk: MOCK_TITLE_UK, en: MOCK_TITLE_EN },
  numberKind: 'op',
  name: { uk: MOCK_NAME_UK, en: MOCK_NAME_EN },
  creationYear: MOCK_CREATION_YEAR,
  genre: { uk: MOCK_GENRE, en: MOCK_GENRE },
  adminTitle: MOCK_NAME_UK,
  slug: MOCK_SLUG,
  status: OpusStatus.Draft as unknown as DbOpus['status'],
  coverImage: { src: 'img.jpg', alt: { uk: 'а', en: 'a' }, caption: { uk: '', en: '' } },
  description: { uk: 'Опис', en: 'Desc' },
  introDescription: { uk: '', en: '' },
  parts: { uk: '', en: '' },
  performancesTitle: null,
  keywords: { uk: 'к', en: 'k' },
  allowIndexation: { uk: true, en: true },
  publishedAt: null,
  meta: { views: 0 },
  createdAt: MOCK_DATE,
  updatedAt: MOCK_UPDATED_DATE,
  compositions: [],
  ...overrides
});

describe('OpusRepository', () => {
  const findOneMock = jest.fn();
  const findMock = jest.fn();
  const countDocumentsMock = jest.fn();
  const saveMock = jest.fn();
  const updateOneMock = jest.fn();
  const findByIdMock = jest.fn();
  const findOneAndUpdateMock = jest.fn();

  const MockModel = jest.fn().mockImplementation(() => ({
    save: saveMock
  })) as unknown as Model<DbOpus> & {
    findOne: jest.Mock;
    find: jest.Mock;
    countDocuments: jest.Mock;
    updateOne: jest.Mock;
    findById: jest.Mock;
    findOneAndUpdate: jest.Mock;
  };

  MockModel.findOne = findOneMock;
  MockModel.find = findMock;
  MockModel.countDocuments = countDocumentsMock;
  MockModel.updateOne = updateOneMock;
  MockModel.findById = findByIdMock;
  MockModel.findOneAndUpdate = findOneAndUpdateMock;

  let repository: IOpusRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = OpusRepository({ OpusModel: MockModel });
  });

  const createInput: CreateOpusInput = {
    number: OPUS_NUMBER_1,
    title: { uk: MOCK_TITLE_UK, en: MOCK_TITLE_EN },
    numberKind: OpusNumberKind.Op,
    name: { uk: 'Новий опус', en: 'New Opus' },
    creationYear: MOCK_CREATION_YEAR,
    genre: { uk: MOCK_GENRE, en: MOCK_GENRE },
    adminTitle: 'Новий опус',
    description: { uk: 'Опис', en: 'Desc' },
    keywords: { uk: 'к', en: 'k' },
    allowIndexation: { uk: true, en: true },
    slug: MOCK_SLUG,
    coverImage: { src: 'img.jpg', alt: { uk: 'а', en: 'a' }, caption: { uk: '', en: '' } },
    status: OpusStatus.Draft as unknown as CreateOpusInput['status'],
    meta: { views: 0 }
  };

  describe('findByComplexKey', () => {
    it('returns the opus when found with valid parameters', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(createMockOpusDoc()) });
      const result = await repository.findByComplexKey(OPUS_NUMBER_1, 'op', '  ');
      expect(findOneMock).toHaveBeenCalledWith({ number: OPUS_NUMBER_1, numberKind: 'op', additionalText: null });
      expect(result?.number).toBe(OPUS_NUMBER_1);
    });

    it('returns null when number is undefined', async () => {
      const result = await repository.findByComplexKey(undefined as unknown as number, 'op', null);
      expect(result).toBeNull();
      expect(findOneMock).not.toHaveBeenCalled();
    });

    it('trims additionalText if provided and non-empty', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(createMockOpusDoc({ additionalText: 'extra' })) });
      const result = await repository.findByComplexKey(OPUS_NUMBER_1, 'op', '  extra  ');
      expect(findOneMock).toHaveBeenCalledWith({ number: OPUS_NUMBER_1, numberKind: 'op', additionalText: 'extra' });
      expect(result?.number).toBe(OPUS_NUMBER_1);
    });

    it('returns null when document is not found', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      const result = await repository.findByComplexKey(OPUS_NUMBER_1, 'op', null);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates a new opus when the composite key is unique', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      saveMock.mockResolvedValue({ toObject: (): DbOpus => createMockOpusDoc({ number: OPUS_NUMBER_1 }) });

      const result = await repository.create(createInput);

      expect(result.number).toBe(OPUS_NUMBER_1);
      expect(saveMock).toHaveBeenCalled();
    });

    it('throws when the composite key already exists', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(createMockOpusDoc()) });

      await expect(repository.create(createInput)).rejects.toThrow(opusServiceErrors.OPUS_ALREADY_EXISTS);
      expect(saveMock).not.toHaveBeenCalled();
    });

    it('defaults meta views to 0 when the input has no meta', async (): Promise<void> => {
      const inputWithoutMeta: CreateOpusInput = {
        number: OPUS_NUMBER_2,
        title: { uk: MOCK_TITLE_UK, en: MOCK_TITLE_EN },
        numberKind: OpusNumberKind.Op,
        status: OpusStatus.Draft as unknown as CreateOpusInput['status'],
      };
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      saveMock.mockResolvedValue({ toObject: (): DbOpus => createMockOpusDoc({ number: OPUS_NUMBER_2 }) });

      const result = await repository.create(inputWithoutMeta);

      expect(MockModel).toHaveBeenCalledWith(expect.objectContaining({ meta: { views: 0 } }));
      expect(result.number).toBe(OPUS_NUMBER_2);
    });
  });

  describe('toEntity mapping', () => {
    it('applies fallback defaults for nullish optional fields', async (): Promise<void> => {
      const doc = createMockOpusDoc({
        number: OPUS_NUMBER_1,
        numberKind: 'op',
        name: null,
        creationYear: MOCK_CREATION_YEAR,
        endYear: '1925',
        genre: null,
        adminTitle: null,
        slug: null,
        description: null,
        keywords: null,
        allowIndexation: null,
        coverImage: null,
        status: undefined,
        meta: undefined,
        additionalText: 'Додатковий текст',
        datesNote: 'Нотатка про дати',
        publishedAt: MOCK_PUBLISHED_DATE
      });
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(doc) });

      const result = await repository.findByComplexKey(OPUS_NUMBER_1, 'op', null);

      expect(result?.number).toBe(OPUS_NUMBER_1);
      expect(result?.numberKind).toBe('op');
      expect(result?.name).toEqual({ uk: '', en: '' });
      expect(result?.additionalText).toBe('Додатковий текст');
      expect(result?.creationYear).toBe(MOCK_CREATION_YEAR);
      expect(result?.endYear).toBe('1925');
      expect(result?.datesNote).toBe('Нотатка про дати');
      expect(result?.genre).toBeUndefined();
      expect(result?.adminTitle).toBeUndefined();
      expect(result?.slug).toBeUndefined();
      expect(result?.description).toBeUndefined();
      expect(result?.keywords).toBeUndefined();
      expect(result?.allowIndexation).toBeUndefined();
      expect(result?.coverImage).toBeUndefined();
      expect(result?.status).toBeUndefined();
      expect(result?.meta).toEqual({ views: 0 });
      expect(result?.publishedAt).toBe(MOCK_PUBLISHED_DATE);
    });

    it('keeps provided optional values instead of applying fallbacks', async (): Promise<void> => {
      const doc = createMockOpusDoc({ numberKind: 'sineop', meta: { views: 42 } });
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(doc) });

      const result = await repository.findByComplexKey(OPUS_NUMBER_1, 'sineop', null);

      expect(result?.numberKind).toBe('sineop');
      expect(result?.number).toBe(OPUS_NUMBER_1);
      expect(result?.meta).toEqual({ views: 42 });
    });

    it('maps gallery and performances correctly including edge cases', async (): Promise<void> => {
      const doc = createMockOpusDoc({
        gallery: [
          {
            _id: { toString: (): string => 'gal1' },
            src: 'image1.jpg',
            description: { uk: 'Опис 1', en: 'Desc 1' },
            altText: { uk: 'Альт 1', en: 'Alt 1' },
            crop: { x: 10, y: 20, width: 100, height: 200 }
          },
          {
            _id: { toString: (): string => 'gal2' },
            src: 'image2.jpg',
            crop: { width: 100, height: 100 }
          },
          {
            src: 'image3.jpg',
            description: undefined,
            altText: undefined,
            crop: null
          }
        ],
        performances: [
          {
            _id: { toString: (): string => 'perf1' },
            title: { uk: 'Виступ 1', en: 'Perf 1' },
            videoUrl: MOCK_YOUTUBE_URL_1
          },
          {
            title: null,
            videoUrl: MOCK_YOUTUBE_URL_2
          }
        ]
      });

      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(doc) });

      const result = await repository.findByComplexKey(OPUS_NUMBER_1, 'op', null);

      expect(result?.gallery).toHaveLength(3);
      expect(result?.gallery?.[0]).toEqual({
        id: 'gal1',
        src: 'image1.jpg',
        description: { uk: 'Опис 1', en: 'Desc 1' },
        altText: { uk: 'Альт 1', en: 'Alt 1' },
        crop: { x: 10, y: 20, width: 100, height: 200 }
      });
      expect(result?.gallery?.[1]?.crop).toBeNull();
      expect(result?.gallery?.[2]?.id).toBe('');

      expect(result?.performances).toHaveLength(2);
      expect(result?.performances?.[0]).toEqual({
        id: 'perf1',
        title: { uk: 'Виступ 1', en: 'Perf 1' },
        videoUrl: MOCK_YOUTUBE_URL_1
      });
      expect(result?.performances?.[1]?.id).toBe('');
    });

    it('normalizes crop coordinates, falling back to 0 for invalid/missing values', async (): Promise<void> => {
      const doc = createMockOpusDoc({
        gallery: [
          {
            _id: { toString: (): string => 'gal-crop' },
            src: 'crop.jpg',
            crop: {
              x: '5' as unknown as number,
              y: 0,
              width: undefined as unknown as number,
              height: 'not-a-number' as unknown as number
            }
          }
        ]
      });
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(doc) });

      const result = await repository.findByComplexKey(OPUS_NUMBER_1, 'op', null);

      expect(result?.gallery?.[0]?.crop).toEqual({
        x: 5,
        y: 0,
        width: 0,
        height: 0
      });
    });
  });

  describe('findAll', () => {
    const mockChain = () => ({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([createMockOpusDoc()])
    });

    it('filters by status and sorts', async () => {
      const chain = mockChain();
      findMock.mockReturnValue(chain);

      const result = await repository.findAll({
        statuses: [OpusStatus.Draft],
        numberKind: OpusNumberKind.Op,
        sort: [{ sortBy: 'number', sortOrder: SortOrder.Asc }]
      });

      expect(result).toHaveLength(1);
      expect(chain.sort).toHaveBeenCalledWith({ number: 1 });
    });

    it('applies fallback logic for numberKind === Op inside buildQuery', async () => {
      const chain = mockChain();
      findMock.mockReturnValue(chain);

      await repository.findAll({
        numberKind: OpusNumberKind.Op
      });

      expect(findMock).toHaveBeenCalledWith(
        expect.objectContaining({
          $and: expect.arrayContaining([
            expect.objectContaining({
              $or: [
                { numberKind: OpusNumberKind.Op },
                { numberKind: { $exists: false } },
                { numberKind: null }
              ]
            })
          ])
        })
      );
    });
    it('applies direct filtering for other numberKind values inside buildQuery', async () => {
      const chain = mockChain();
      findMock.mockReturnValue(chain);

      await repository.findAll({
        numberKind: OpusNumberKind.Sineop
      });

      expect(findMock).toHaveBeenCalledWith(
        expect.objectContaining({
          $and: expect.arrayContaining([
            expect.objectContaining({
              numberKind: OpusNumberKind.Sineop
            })
          ])
        })
      );
    });
    it('applies fallback for missing creationYear', async () => {
      const doc = createMockOpusDoc({ creationYear: '' });
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(doc) });

      const result = await repository.findByComplexKey(OPUS_NUMBER_1, 'op', null);

      expect(result?.creationYear).toBe('');
    });

    it('uses fallback empty object when buildBaseQuery returns null', async () => {
      const chain = mockChain();
      findMock.mockReturnValue(chain);

      (buildBaseQuery as jest.Mock).mockReturnValueOnce(null);

      await repository.findAll({
        numberKind: OpusNumberKind.Sineop
      });

      expect(findMock).toHaveBeenCalledWith(
        expect.objectContaining({
          $and: expect.arrayContaining([
            expect.objectContaining({
              numberKind: OpusNumberKind.Sineop
            })
          ])
        })
      );
    });
    
    it('falls back numberKind to "op" when nullish', async (): Promise<void> => {
      const doc = createMockOpusDoc({ numberKind: undefined });
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(doc) });

      const result = await repository.findByComplexKey(OPUS_NUMBER_1, 'op', null);

      expect(result?.numberKind).toBe('op');
    });

    it('converts a string name into a bilingual object', async (): Promise<void> => {
      const doc = createMockOpusDoc({
        name: 'Просто рядкова назва' as unknown as DbOpus['name']
      });
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(doc) });

      const result = await repository.findByComplexKey(OPUS_NUMBER_1, 'op', null);

      expect(result?.name).toEqual({
        uk: 'Просто рядкова назва',
        en: 'Просто рядкова назва'
      });
    });

    it('sets introDescription and parts to undefined when nullish', async (): Promise<void> => {
      const doc = createMockOpusDoc({
        introDescription: null,
        parts: undefined
      });
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(doc) });

      const result = await repository.findByComplexKey(OPUS_NUMBER_1, 'op', null);

      expect(result?.introDescription).toBeUndefined();
      expect(result?.parts).toBeUndefined();
    });

    it('keeps provided introDescription and parts values', async (): Promise<void> => {
      const doc = createMockOpusDoc({
        introDescription: { uk: 'Вступ', en: 'Intro' },
        parts: { uk: 'Частини', en: 'Parts' }
      });
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(doc) });

      const result = await repository.findByComplexKey(OPUS_NUMBER_1, 'op', null);

      expect(result?.introDescription).toEqual({ uk: 'Вступ', en: 'Intro' });
      expect(result?.parts).toEqual({ uk: 'Частини', en: 'Parts' });
    });
  });

  describe('compositions management methods', () => {
    it('does nothing in moveCompositionsToCompositionsOpus when list is empty', async () => {
      await repository.moveCompositionsToCompositionsOpus([]);
      expect(findOneAndUpdateMock).not.toHaveBeenCalled();
    });

    it('upserts loose opus via findOneAndUpdate then adds compositions with $addToSet', async () => {
      findOneAndUpdateMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: LOOSE_OPUS_ID })
      });
      updateOneMock.mockResolvedValue({});

      await repository.moveCompositionsToCompositionsOpus(['comp1', 'comp2']);

      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { numberKind: 'compositions' },
        {
          $setOnInsert: expect.objectContaining({
            numberKind: 'compositions',
            number: 0,
            compositions: []
          })
        },
        { upsert: true, new: true }
      );
      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: LOOSE_OPUS_ID },
        { $addToSet: { compositions: { $each: ['comp1', 'comp2'] } } }
      );
    });

    it('updates loose opus using $addToSet if it already exists during moveCompositionsToCompositionsOpus', async () => {
      findOneAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: LOOSE_OPUS_ID }) });
      updateOneMock.mockResolvedValue({});

      await repository.moveCompositionsToCompositionsOpus(['comp1', 'comp2']);

      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: LOOSE_OPUS_ID },
        { $addToSet: { compositions: { $each: ['comp1', 'comp2'] } } }
      );
    });

    it('does nothing in removeCompositionsFromCompositionsOpus when list is empty', async () => {
      await repository.removeCompositionsFromCompositionsOpus([]);
      expect(findOneMock).not.toHaveBeenCalled();
    });

    it('does nothing in removeCompositionsFromCompositionsOpus when loose opus does not exist', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      await repository.removeCompositionsFromCompositionsOpus(['comp1']);

      expect(updateOneMock).not.toHaveBeenCalled();
    });

    it('removes compositions from loose opus if it exists during removeCompositionsFromCompositionsOpus', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: LOOSE_OPUS_ID }) });
      updateOneMock.mockResolvedValue({});

      await repository.removeCompositionsFromCompositionsOpus(['comp1']);

      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: LOOSE_OPUS_ID },
        { $pull: { compositions: { $in: ['comp1'] } } }
      );
    });

    it('unlinks opus by finding it and moving its compositions', async () => {
      findByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ compositions: ['comp-to-move'] }) });
      findOneAndUpdateMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: LOOSE_OPUS_ID })
      });
      updateOneMock.mockResolvedValue({});

      await repository.unlink(MOCK_ID);

      expect(findByIdMock).toHaveBeenCalledWith(MOCK_ID);
      expect(findOneAndUpdateMock).toHaveBeenCalled();
      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: LOOSE_OPUS_ID },
        { $addToSet: { compositions: { $each: ['comp-to-move'] } } }
      );
    });
  });
});
