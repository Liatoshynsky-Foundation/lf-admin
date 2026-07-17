import { OpusQuery } from './opusQuery';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { Opus } from '~/domain/entities/Opus';
import type { ICompositionRepository } from '~/domain/repositories/compositionRepository';
import type { IOpusRepository } from '~/domain/repositories/opusRepository';
import { OpusStatus } from '~/types/enums/common.enums';
import { OpusNumberKind } from '~/types/graphql/generated/graphql';

interface MockCompositionRepository extends ICompositionRepository {
  findByOpusIds: jest.Mock;
}

describe('OpusQuery Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<IOpusRepository>> = {
    findById: jest.fn(),
    findByNumber: jest.fn(),
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    count: jest.fn()
  };

  const mockCompositionsRepo: jest.Mocked<Partial<MockCompositionRepository>> = {
    findByOpusId: jest.fn(),
    findByOpusIds: jest.fn(),
    syncForOpus: jest.fn(),
    deleteByOpusId: jest.fn(),
    searchByTitle: jest.fn()
  };

  const buildContext = (isAdmin: boolean): GraphQLContext =>
    ({
      admin: isAdmin,
      requestContainer: {
        cradle: { 
          opusRepository: mockRepo as IOpusRepository, 
          compositionsRepository: mockCompositionsRepo as unknown as ICompositionRepository 
        }
      }
    }) as unknown as GraphQLContext;

  const adminContext = buildContext(true);
  const userContext = buildContext(false);

  const mockEntity = { id: '1', number: 'op.1' } as Opus;

  beforeEach(() => {
    jest.clearAllMocks();
    (mockCompositionsRepo.findByOpusId as jest.Mock).mockResolvedValue([]);
    (mockCompositionsRepo.findByOpusIds as jest.Mock).mockResolvedValue([]);
  });

  it('opusById should reject unauthenticated requests', async () => {
    await expect(OpusQuery.opusById({}, { id: '1' }, userContext)).rejects.toThrow(
      'You must be logged in to access this resource.'
    );
  });

  it('opusById should call repo.findById and attach compositions', async () => {
    (mockRepo.findById as jest.Mock).mockResolvedValue(mockEntity);

    const result = await OpusQuery.opusById({}, { id: '1' }, adminContext);

    expect(mockRepo.findById).toHaveBeenCalledWith('1');
    expect(mockCompositionsRepo.findByOpusId).toHaveBeenCalledWith('1');
    expect(result).toEqual({ ...mockEntity, compositions: [] });
  });

  it('opusByNumber should call repo.findByNumber', async () => {
    (mockRepo.findByNumber as jest.Mock).mockResolvedValue(mockEntity);

    const result = await OpusQuery.opusByNumber({}, { number: 'op.1' }, adminContext);

    expect(mockRepo.findByNumber).toHaveBeenCalledWith('op.1');
    expect(result).toEqual(mockEntity);
  });

  it('searchCompositions should call compositionsRepository.searchByTitle', async () => {
    (mockCompositionsRepo.searchByTitle as jest.Mock).mockResolvedValue([]);

    const result = await OpusQuery.searchCompositions({}, { search: 'Після' }, adminContext);

    expect(mockCompositionsRepo.searchByTitle).toHaveBeenCalledWith('Після');
    expect(result).toEqual([]);
  });

  it('allOpuses should call repo.findAll with mapped filters and numberKind', async () => {
    (mockRepo.findAll as jest.Mock).mockResolvedValue([mockEntity]);
    const mockComposition = { id: '100', opusId: '1', title: { uk: 'Твір' } };
    (mockCompositionsRepo.findByOpusIds as jest.Mock).mockResolvedValue([mockComposition]);

    const result = await OpusQuery.allOpuses({}, { filters: { statuses: [OpusStatus.Draft] } }, adminContext);

    expect(mockRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        statuses: [OpusStatus.Draft],
        numberKind: OpusNumberKind.Op
      })
    );
    expect(mockCompositionsRepo.findByOpusIds).toHaveBeenCalledWith(['1']);
    expect(result).toHaveLength(1);
    expect(result[0].compositions).toEqual([mockComposition]);
  });

  it('allOpuses should return empty array if no opuses found', async () => {
    (mockRepo.findAll as jest.Mock).mockResolvedValue([]);

    const result = await OpusQuery.allOpuses({}, { filters: {} }, adminContext);

    expect(result).toEqual([]);
    expect(mockCompositionsRepo.findByOpusIds).not.toHaveBeenCalled();
  });

  it('paginatedOpuses should call repo.findPaginated', async () => {
    (mockRepo.findPaginated as jest.Mock).mockResolvedValue({
      items: [mockEntity],
      total: 1,
      page: 1,
      totalPages: 1
    });

    const result = await OpusQuery.paginatedOpuses({}, { page: 1, limit: 10 }, adminContext);

    expect(mockRepo.findPaginated).toHaveBeenCalledWith(1, 10, undefined);
    expect(result.total).toBe(1);
  });
});
