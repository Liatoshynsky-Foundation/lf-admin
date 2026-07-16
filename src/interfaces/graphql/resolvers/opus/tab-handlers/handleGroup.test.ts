import { handleGroup } from './handleGroup';
import { Opus } from '~/domain/entities/Opus';
import type { ICompositionRepository } from '~/domain/repositories/compositionRepository';
import type { IOpusRepository } from '~/domain/repositories/opusRepository';
import { Composition, OpusNumberKind, WorksTab } from '~/types/graphql/generated/graphql';

interface MockCompositionRepository extends ICompositionRepository {
  findByOpusIds: jest.Mock;
}

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

describe('handleGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return opus groups with compositions', async () => {
    const groups = [
      { id: '1', number: 'op.1' },
      { id: '2', number: 'op.2' },
    ] as Opus[];

    const compositions = [
      { id: 'c1', opusId: '1' },
      { id: 'c2', opusId: '1' },
      { id: 'c3', opusId: '2' },
    ] as Composition[];

    (mockRepo.count as jest.Mock).mockResolvedValue(2);
    (mockRepo.findAll as jest.Mock).mockResolvedValue(groups);
    (mockCompositionsRepo.findByOpusIds as jest.Mock).mockResolvedValue(compositions);

    const result = await handleGroup(
      WorksTab.Opus,
      mockRepo as IOpusRepository,
      undefined,
      1,
      mockCompositionsRepo as unknown as ICompositionRepository,
      10
    );

    expect(mockRepo.count).toHaveBeenCalledWith({
      numberKind: OpusNumberKind.Op,
    });

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      numberKind: OpusNumberKind.Op,
    });

    expect(mockCompositionsRepo.findByOpusIds).toHaveBeenCalledWith(['1', '2']);

    expect(result).toEqual({
      groups: [
        {
          id: '1',
          number: 'op.1',
          compositions: [
            { id: 'c1', opusId: '1' },
            { id: 'c2', opusId: '1' },
          ],
        },
        {
          id: '2',
          number: 'op.2',
          compositions: [{ id: 'c3', opusId: '2' }],
        },
      ],
      works: [],
      total: 2,
      page: 1,
      totalPages: 1,
    });
  });

  it('should use Woo number kind', async () => {
    (mockRepo.count as jest.Mock).mockResolvedValue(0);
    (mockRepo.findAll as jest.Mock).mockResolvedValue([]);
    (mockCompositionsRepo.findByOpusIds as jest.Mock).mockResolvedValue([]);

    await handleGroup(
      WorksTab.Woo,
      mockRepo as IOpusRepository,
      undefined,
      1,
      mockCompositionsRepo as unknown as ICompositionRepository,
      10
    );

    expect(mockRepo.count).toHaveBeenCalledWith({
      numberKind: OpusNumberKind.Woo,
    });
  });

  it('should return empty groups', async () => {
    (mockRepo.count as jest.Mock).mockResolvedValue(0);
    (mockRepo.findAll as jest.Mock).mockResolvedValue([]);
    (mockCompositionsRepo.findByOpusIds as jest.Mock).mockResolvedValue([]);

    const result = await handleGroup(
      WorksTab.Opus,
      mockRepo as IOpusRepository,
      undefined,
      1,
      mockCompositionsRepo as unknown as ICompositionRepository,
      10
    );

    expect(result).toEqual({
      groups: [],
      works: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
  });

  it('should calculate totalPages', async () => {
    (mockRepo.count as jest.Mock).mockResolvedValue(21);
    (mockRepo.findAll as jest.Mock).mockResolvedValue([]);
    (mockCompositionsRepo.findByOpusIds as jest.Mock).mockResolvedValue([]);

    const result = await handleGroup(
      WorksTab.Opus,
      mockRepo as IOpusRepository,
      undefined,
      3,
      mockCompositionsRepo as unknown as ICompositionRepository,
      10
    );

    expect(result.page).toBe(3);
    expect(result.totalPages).toBe(3);
  });

  it('should pass filters to repositories', async () => {
    (mockRepo.count as jest.Mock).mockResolvedValue(0);
    (mockRepo.findAll as jest.Mock).mockResolvedValue([]);
    (mockCompositionsRepo.findByOpusIds as jest.Mock).mockResolvedValue([]);

    const filters = {
      search: 'test',
      statuses: ['draft'],
    };

    await handleGroup(
      WorksTab.Opus,
      mockRepo as IOpusRepository,
      filters,
      1,
      mockCompositionsRepo as unknown as ICompositionRepository,
      10
    );

    expect(mockRepo.count).toHaveBeenCalledWith({
      search: 'test',
      statuses: ['draft'],
      numberKind: OpusNumberKind.Op,
    });

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      search: 'test',
      statuses: ['draft'],
      numberKind: OpusNumberKind.Op,
    });
  });

  it('should assign empty compositions array when group has no compositions', async () => {
    const groups = [
      { id: '1', number: 'op.1' },
      { id: '2', number: 'op.2' },
    ] as Opus[];

    const compositions = [
      { id: 'c1', opusId: '1' },
    ] as Composition[];

    (mockRepo.count as jest.Mock).mockResolvedValue(2);
    (mockRepo.findAll as jest.Mock).mockResolvedValue(groups);
    (mockCompositionsRepo.findByOpusIds as jest.Mock).mockResolvedValue(compositions);

    const result = await handleGroup(
      WorksTab.Opus,
    mockRepo as IOpusRepository,
    undefined,
    1,
    mockCompositionsRepo as unknown as ICompositionRepository,
    10
    );

    expect(result.groups).toEqual([
      {
        id: '1',
        number: 'op.1',
        compositions: [{ id: 'c1', opusId: '1' }],
      },
      {
        id: '2',
        number: 'op.2',
        compositions: [],
      },
    ]);
  });
});