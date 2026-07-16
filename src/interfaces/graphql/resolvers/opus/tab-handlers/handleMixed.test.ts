import { mapFilters } from '../../helpers';
import { handleMixed } from './handleMixed';
import { mappedCompositions, mappedGroups } from './tabHandlersHelpers';
import type { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import type { IOpusRepository } from '~/src/domain/repositories/opusRepository';

jest.mock('../../helpers', () => ({
  mapFilters: jest.fn(),
}));

jest.mock('./tabHandlersHelpers', () => ({
  mappedGroups: jest.fn(),
  mappedCompositions: jest.fn(),
  totalPages: jest.fn((total: number, pageSize: number) => Math.ceil(total / pageSize)),
}));

describe('handleMixed', () => {
  const repo = {
    count: jest.fn(),
  } as unknown as jest.Mocked<Partial<IOpusRepository>>;

  const compositionsRepo = {
    count: jest.fn(),
  } as unknown as jest.Mocked<Partial<ICompositionRepository>>;

  beforeEach(() => {
    jest.clearAllMocks();

    (mapFilters as jest.Mock).mockImplementation((f) => f);

    (mappedGroups as jest.Mock).mockResolvedValue({
      groups: [{ id: 'g1' }],
      total: 5,
    });

    (mappedCompositions as jest.Mock).mockResolvedValue({
      works: [{ id: 'w1' }],
      total: 8,
    });
  });

  it('should return only groups when page contains only opuses', async () => {
    (repo.count as jest.Mock).mockResolvedValue(10);
    (compositionsRepo.count as jest.Mock).mockResolvedValue(5);

    const result = await handleMixed(
      repo as IOpusRepository,
      compositionsRepo as ICompositionRepository,
      undefined,
      1,
      5
    );

    expect(mappedGroups).toHaveBeenCalledWith(
      repo,
      compositionsRepo,
      {}
    );

    expect(mappedCompositions).not.toHaveBeenCalled();

    expect(result).toEqual({
      groups: [{ id: 'g1' }],
      works: [],
      total: 15,
      page: 1,
      totalPages: 3,
    });
  });

  it('should return mixed groups and works', async () => {
    (repo.count as jest.Mock).mockResolvedValue(8);
    (compositionsRepo.count as jest.Mock).mockResolvedValue(12);

    const result = await handleMixed(
      repo as IOpusRepository,
      compositionsRepo as ICompositionRepository,
      undefined,
      2,
      5
    );

    expect(mappedGroups).toHaveBeenCalledWith(
      repo,
      compositionsRepo,
      {
        limit: 3,
      }
    );

    expect(mappedCompositions).toHaveBeenCalledWith(
      compositionsRepo,
      {
        opusId: null,
        limit: 2,
        skip: 0,
      }
    );

    expect(result).toEqual({
      groups: [{ id: 'g1' }],
      works: [{ id: 'w1' }],
      total: 20,
      page: 2,
      totalPages: 4,
    });
  });

  it('should return only compositions when all groups are skipped', async () => {
    (repo.count as jest.Mock).mockResolvedValue(5);
    (compositionsRepo.count as jest.Mock).mockResolvedValue(12);

    const result = await handleMixed(
      repo as IOpusRepository,
      compositionsRepo as ICompositionRepository,
      undefined,
      3,
      5
    );

    expect(mappedGroups).not.toHaveBeenCalled();

    expect(mappedCompositions).toHaveBeenCalledWith(
      compositionsRepo,
      {
        opusId: null,
        skip: 5,
        limit: 5,
      }
    );

    expect(result).toEqual({
      groups: [],
      works: [{ id: 'w1' }],
      total: 17,
      page: 3,
      totalPages: 4,
    });
  });

  it('should pass mapped filters to repositories', async () => {
    (mapFilters as jest.Mock).mockReturnValue({
      search: 'test',
      statuses: ['draft'],
    });

    (repo.count as jest.Mock).mockResolvedValue(1);
    (compositionsRepo.count as jest.Mock).mockResolvedValue(1);

    await handleMixed(
      repo as IOpusRepository,
      compositionsRepo as ICompositionRepository,
      { search: 'test', statuses: ['draft'] },
      1,
      10
    );

    expect(repo.count).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'test',
        statuses: ['draft'],
      })
    );

    expect(compositionsRepo.count).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'test',
        statuses: ['draft'],
        opusId: null,
      })
    );
  });
});