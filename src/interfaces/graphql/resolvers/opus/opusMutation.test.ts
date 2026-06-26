import { CreateOpusGQLInput, OpusMutation } from './opusMutation';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { Opus } from '~/domain/entities/Opus';
import type { ICompositionRepository } from '~/domain/repositories/compositionRepository';
import type { IOpusRepository } from '~/domain/repositories/opusRepository';
import { OpusStatus } from '~/types/enums/common.enums';

jest.mock('mongoose');

import * as helpers from '../helpers';

jest.mock('~/src/shared/utils/slugGenerator/slugGenerator', () => ({
  generateUniqueSlug: jest.fn((title: string) =>
    Promise.resolve(`slug-${title.toLowerCase().replaceAll(/\s+/g, '-')}`)
  )
}));

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  syncImagesCrops: jest.fn(),
  markImagesAsUsed: jest.fn()
}));

describe('OpusMutation Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<IOpusRepository>> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findByNumber: jest.fn(),
    count: jest.fn()
  };

  const mockCompositionsRepo: jest.Mocked<ICompositionRepository> = {
    findByOpusId: jest.fn(),
    syncForOpus: jest.fn(),
    deleteByOpusId: jest.fn(),
    searchByTitle: jest.fn()
  };

  const buildContext = (isAdmin: boolean): GraphQLContext =>
    ({
      admin: isAdmin,
      requestContainer: {
        cradle: {
          opusRepository: mockRepo,
          compositionsRepository: mockCompositionsRepo,
          assetsRepository: {}
        }
      }
    }) as unknown as GraphQLContext;

  const adminContext = buildContext(true);
  const userContext = buildContext(false);

  const createMockEntity = (overrides: Partial<Opus> = {}): Opus => ({
    id: '1',
    number: 'op.1',
    title: { uk: 'Тест', en: 'Test' },
    releaseYear: 1922,
    numberKind: 'op',
    name: 'Перший струнний квартет',
    creationYear: '1922',
    genre: 'Струнний квартет',
    adminTitle: 'Перший струнний квартет',
    description: { uk: 'Опис', en: 'Desc' },
    keywords: { uk: 'к', en: 'k' },
    allowIndexation: { uk: true, en: true },
    slug: 'slug-test',
    coverImage: { src: 'opus.jpg', alt: { uk: '', en: '' }, caption: { uk: '', en: '' } },
    status: OpusStatus.Draft,
    meta: { views: 0 },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    ...overrides
  });

  const createMockInput = (overrides: Partial<CreateOpusGQLInput> = {}): CreateOpusGQLInput => ({
    numberKind: 'op',
    number: '1',
    name: 'Новий опус',
    creationYear: '1922',
    genre: 'Струнний квартет',
    compositions: [],
    adminTitle: 'Новий опус',
    title: { uk: 'Опус', en: 'Opus' },
    description: { uk: 'Опис', en: 'Desc' },
    keywords: { uk: 'к', en: 'k' },
    allowIndexation: { uk: true, en: true },
    coverImage: { src: 'opus.jpg', alt: { uk: 'alt uk', en: 'alt en' } },
    status: OpusStatus.Draft,
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (mockRepo.findBySlug as jest.Mock).mockResolvedValue(null);
    (mockRepo.findByNumber as jest.Mock).mockResolvedValue(null);
    mockCompositionsRepo.syncForOpus.mockResolvedValue([]);
    mockCompositionsRepo.findByOpusId.mockResolvedValue([]);
    mockCompositionsRepo.deleteByOpusId.mockResolvedValue(undefined);
  });

  describe('Security/Authentication', () => {
    it('should throw UNAUTHENTICATED error if context.admin is false for createOpus', async () => {
      const input = createMockInput();

      await expect(OpusMutation.createOpus({}, { input }, userContext)).rejects.toThrow(
        'You must be logged in to access this resource.'
      );
    });

    it('should throw UNAUTHENTICATED error for updateOpus if not admin', async () => {
      await expect(OpusMutation.updateOpus({}, { id: '1', input: {} }, userContext)).rejects.toThrow(
        'You must be logged in to access this resource.'
      );
    });
  });

  describe('Business Logic', () => {
    it('should compose the number, generate a slug and call repo.create', async () => {
      const input = createMockInput();
      (mockRepo.create as jest.Mock).mockResolvedValue(createMockEntity({ id: 'opus-1', slug: 'slug-новий-опус' }));

      const result = await OpusMutation.createOpus({}, { input }, adminContext);

      expect(result.slug).toBe('slug-новий-опус');
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ number: 'op.1', name: 'Новий опус', status: OpusStatus.Draft })
      );
      expect(mockCompositionsRepo.syncForOpus).toHaveBeenCalledWith('opus-1', []);
    });

    it('should compose a "wo." number for the В/о kind', async () => {
      const input = createMockInput({ numberKind: 'woo', number: '3' });
      (mockRepo.create as jest.Mock).mockResolvedValue(createMockEntity({ id: 'opus-wo', number: 'wo.3' }));

      await OpusMutation.createOpus({}, { input }, adminContext);

      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ number: 'wo.3' }));
    });

    it('should throw a duplicate error when the composed number already exists', async () => {
      const input = createMockInput({ number: '1' });
      (mockRepo.findByNumber as jest.Mock).mockResolvedValue(createMockEntity({ id: 'existing', number: 'op.1' }));

      await expect(OpusMutation.createOpus({}, { input }, adminContext)).rejects.toThrow(
        'Opus with number "op.1" already exists'
      );
      expect(mockRepo.findByNumber).toHaveBeenCalledWith('op.1');
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should default to Draft status if no status is provided', async () => {
      const { status: _status, ...inputWithoutStatus } = createMockInput();
      (mockRepo.create as jest.Mock).mockResolvedValue(createMockEntity({ status: OpusStatus.Draft }));

      await OpusMutation.createOpus({}, { input: inputWithoutStatus as CreateOpusGQLInput }, adminContext);

      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ status: OpusStatus.Draft }));
    });

    it('should call syncImagesCrops when coverImage has a crop', async () => {
      const input = createMockInput({
        coverImage: { src: 'opus.jpg', alt: { uk: '', en: '' }, crop: { x: 1, y: 1, width: 10, height: 10 } }
      });
      (mockRepo.create as jest.Mock).mockResolvedValue(createMockEntity({ id: 'opus-crop' }));

      await OpusMutation.createOpus({}, { input }, adminContext);

      expect(helpers.syncImagesCrops).toHaveBeenCalledWith('opus-crop', input.coverImage, { isCoverImage: true });
    });

    it('should throw OPUS_NOT_FOUND when updating a missing opus', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        OpusMutation.updateOpus({}, { id: 'missing', input: { name: 'x' } }, adminContext)
      ).rejects.toThrow('Opus with id "missing" not found');
    });

    it('should update opus and replace its compositions', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(createMockEntity({ id: '1' }));
      (mockRepo.update as jest.Mock).mockResolvedValue(createMockEntity({ id: '1', name: 'Оновлено' }));

      const result = await OpusMutation.updateOpus(
        {},
        { id: '1', input: { name: 'Оновлено', compositions: [] } },
        adminContext
      );

      expect(result.name).toBe('Оновлено');
      expect(mockRepo.update).toHaveBeenCalled();
      expect(mockCompositionsRepo.syncForOpus).toHaveBeenCalledWith('1', []);
    });
  });

  describe('Deletion', () => {
    it('deleteOpus: should throw error if not admin', async () => {
      await expect(OpusMutation.deleteOpus({}, { id: '1' }, userContext)).rejects.toThrow(
        'You must be logged in to access this resource.'
      );
    });

    it('deleteOpus: should delete compositions and the opus if admin', async () => {
      (mockRepo.delete as jest.Mock).mockResolvedValue(true);

      const result = await OpusMutation.deleteOpus({}, { id: '1' }, adminContext);

      expect(mockCompositionsRepo.deleteByOpusId).toHaveBeenCalledWith('1');
      expect(mockRepo.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });
  });
});
