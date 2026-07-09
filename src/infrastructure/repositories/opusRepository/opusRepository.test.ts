import { Model } from 'mongoose';

import { DbOpus, OpusRepository } from './opusRepository';
import { CreateOpusInput, IOpusRepository } from '~/domain/repositories/opusRepository';
import { OpusStatus, SortOrder } from '~/types/enums/common.enums';

jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
  Types: {
    ObjectId: {
      isValid: (id: string) => /^[0-9a-fA-F]{24}$/.test(id)
    }
  }
}));

jest.mock('~/src/infrastructure/db/connect', () => jest.fn());

const mockId = '65eddf5e2f1a2b3c4d5e6f7a';

const createMockOpusDoc = (overrides: Partial<DbOpus> = {}): DbOpus => ({
  _id: { toString: () => mockId },
  number: 'op.1',
  title: { uk: 'Опус', en: 'Opus' },
  releaseYear: 1922,
  numberKind: 'op',
  name: { uk: 'Перший струнний квартет', en: 'First string quartet' },
  creationYear: '1922',
  genre: 'Струнний квартет',
  adminTitle: 'Перший струнний квартет',
  slug: 'opus-1',
  status: OpusStatus.Draft,
  coverImage: { src: 'img.jpg', alt: { uk: 'а', en: 'a' }, caption: { uk: '', en: '' } },
  description: { uk: 'Опис', en: 'Desc' },
  keywords: { uk: 'к', en: 'k' },
  allowIndexation: { uk: true, en: true },
  publishedAt: null,
  meta: { views: 0 },
  createdAt: '2026-03-10T10:00:00.000Z',
  updatedAt: '2026-03-11T12:00:00.000Z',
  ...overrides
});

describe('OpusRepository', () => {
  const findOneMock = jest.fn();
  const findMock = jest.fn();
  const countDocumentsMock = jest.fn();
  const saveMock = jest.fn();

  const MockModel = jest.fn().mockImplementation(() => ({
    save: saveMock
  })) as unknown as Model<DbOpus> & {
    findOne: jest.Mock;
    find: jest.Mock;
    countDocuments: jest.Mock;
  };

  MockModel.findOne = findOneMock;
  MockModel.find = findMock;
  MockModel.countDocuments = countDocumentsMock;

  let repository: IOpusRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = OpusRepository({ OpusModel: MockModel });
  });

  const createInput: CreateOpusInput = {
    number: 'op.1',
    title: { uk: 'Опус', en: 'Opus' },
    releaseYear: 1922,
    numberKind: 'op',
    name: { uk: 'Новий опус', en: 'New Opus' },
    creationYear: '1922',
    genre: 'Струнний квартет',
    adminTitle: 'Новий опус',
    description: { uk: 'Опис', en: 'Desc' },
    keywords: { uk: 'к', en: 'k' },
    allowIndexation: { uk: true, en: true },
    slug: 'opus-1',
    coverImage: { src: 'img.jpg', alt: { uk: 'а', en: 'a' }, caption: { uk: '', en: '' } },
    status: OpusStatus.Draft,
    meta: { views: 0 }
  };

  describe('findByNumber', () => {
    it('returns the opus when found', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(createMockOpusDoc()) });

      const result = await repository.findByNumber('op.1');

      expect(findOneMock).toHaveBeenCalledWith({ number: 'op.1' });
      expect(result?.number).toBe('op.1');
    });

    it('returns null when the number is empty', async () => {
      const result = await repository.findByNumber('');

      expect(result).toBeNull();
      expect(findOneMock).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('creates a new opus when the number is unique', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      saveMock.mockResolvedValue({ toObject: () => createMockOpusDoc({ number: 'op.1' }) });

      const result = await repository.create(createInput);

      expect(result.number).toBe('op.1');
      expect(saveMock).toHaveBeenCalled();
    });

    it('throws when the number already exists', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(createMockOpusDoc()) });

      await expect(repository.create(createInput)).rejects.toThrow('Opus with number "op.1" already exists');
      expect(saveMock).not.toHaveBeenCalled();
    });

    it('defaults meta views to 0 when the input has no meta', async (): Promise<void> => {
      const inputWithoutMeta: CreateOpusInput = {
        number: 'op.2',
        title: { uk: 'Опус', en: 'Opus' }
      };
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      saveMock.mockResolvedValue({ toObject: () => createMockOpusDoc({ number: 'op.2' }) });

      const result = await repository.create(inputWithoutMeta);

      expect(MockModel).toHaveBeenCalledWith(expect.objectContaining({ meta: { views: 0 } }));
      expect(result.number).toBe('op.2');
    });
  });

  describe('toEntity mapping', () => {
    it('applies fallback defaults for nullish optional fields', async (): Promise<void> => {
      const doc = createMockOpusDoc({
        releaseYear: null,
        numberKind: undefined,
        name: null,
        creationYear: null,
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
        endYear: '1925',
        datesNote: 'Нотатка про дати',
        publishedAt: '2026-01-01T00:00:00.000Z'
      });
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(doc) });

      const result = await repository.findByNumber('op.1');

      expect(result?.releaseYear).toBeUndefined();
      expect(result?.numberKind).toBe('op');
      expect(result?.name).toEqual({ uk: '', en: '' });
      expect(result?.additionalText).toBe('Додатковий текст');
      expect(result?.creationYear).toBeUndefined();
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
      expect(result?.publishedAt).toBe('2026-01-01T00:00:00.000Z');
    });

    it('keeps provided optional values instead of applying fallbacks', async (): Promise<void> => {
      const doc = createMockOpusDoc({ numberKind: 'woo', meta: { views: 42 } });
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(doc) });

      const result = await repository.findByNumber('op.1');

      expect(result?.numberKind).toBe('woo');
      expect(result?.releaseYear).toBe(1922);
      expect(result?.meta).toEqual({ views: 42 });
    });
  });

  describe('findAll', () => {
    it('filters by status and sorts', async () => {
      const chain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([createMockOpusDoc()])
      };
      findMock.mockReturnValue(chain);

      const result = await repository.findAll({
        statuses: [OpusStatus.Draft],
        sort: [{ sortBy: 'number', sortOrder: SortOrder.Asc }]
      });

      expect(result).toHaveLength(1);
      expect(chain.sort).toHaveBeenCalledWith({ number: 1 });
    });
  });
});
