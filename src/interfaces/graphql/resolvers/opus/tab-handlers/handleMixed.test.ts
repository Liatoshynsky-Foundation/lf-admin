import { mapFilters } from '../../helpers';
import { handleMixed } from './handleMixed';
import { mappedCompositions, mappedGroups } from './tabHandlersHelpers';
import type { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import type { IOpusRepository, OpusFilters } from '~/src/domain/repositories/opusRepository';
import { OpusNumberKind } from '~/types/graphql/generated/graphql';

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
    (repo.count as jest.Mock).mockImplementation((filters: OpusFilters) =>
      Promise.resolve(filters.numberKind === OpusNumberKind.Op ? 10 : 0)
    );
    (compositionsRepo.count as jest.Mock).mockResolvedValue(5);

    const result = await handleMixed(
      repo as IOpusRepository,
      compositionsRepo as ICompositionRepository,
      undefined,
      1,
      5
    );

    expect(repo.count).toHaveBeenCalledTimes(2);
    expect(repo.count).toHaveBeenCalledWith({ numberKind: OpusNumberKind.Op });
    expect(repo.count).toHaveBeenCalledWith({ numberKind: OpusNumberKind.Woo });

    expect(mappedGroups).toHaveBeenCalledTimes(1);
    expect(mappedGroups).toHaveBeenCalledWith(
      repo,
      compositionsRepo,
      { numberKind: OpusNumberKind.Op, skip: 0, limit: 5 }
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
    (repo.count as jest.Mock).mockImplementation((filters: OpusFilters) =>
      Promise.resolve(filters.numberKind === OpusNumberKind.Op ? 8 : 0)
    );
    (compositionsRepo.count as jest.Mock).mockResolvedValue(12);

    const result = await handleMixed(
      repo as IOpusRepository,
      compositionsRepo as ICompositionRepository,
      undefined,
      2,
      5
    );

    expect(mappedGroups).toHaveBeenCalledTimes(1);
    expect(mappedGroups).toHaveBeenCalledWith(
      repo,
      compositionsRepo,
      { numberKind: OpusNumberKind.Op, skip: 5, limit: 3 }
    );
    expect(mappedCompositions).toHaveBeenCalledWith(
      compositionsRepo,
      { isStandalone: true, skip: 0, limit: 2 }
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
    (repo.count as jest.Mock).mockImplementation((filters: OpusFilters) =>
      Promise.resolve(filters.numberKind === OpusNumberKind.Op ? 5 : 0)
    );
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
      { isStandalone: true, skip: 5, limit: 5 }
    );

    expect(result).toEqual({
      groups: [],
      works: [{ id: 'w1' }],
      total: 17,
      page: 3,
      totalPages: 4,
    });
  });

  it('should include both op and woo groups when page spans both kinds', async () => {
    (repo.count as jest.Mock).mockImplementation((filters: OpusFilters) =>
      Promise.resolve(filters.numberKind === OpusNumberKind.Op ? 3 : 6)
    );
    (compositionsRepo.count as jest.Mock).mockResolvedValue(0);

    await handleMixed(
      repo as IOpusRepository,
      compositionsRepo as ICompositionRepository,
      undefined,
      1,
      5
    );

    expect(mappedGroups).toHaveBeenCalledTimes(2);
    expect(mappedGroups).toHaveBeenNthCalledWith(
      1,
      repo,
      compositionsRepo,
      { numberKind: OpusNumberKind.Op, skip: 0, limit: 3 }
    );
    expect(mappedGroups).toHaveBeenNthCalledWith(
      2,
      repo,
      compositionsRepo,
      { numberKind: OpusNumberKind.Woo, skip: 0, limit: 2 }
    );
    expect(mappedCompositions).not.toHaveBeenCalled();
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
        numberKind: OpusNumberKind.Op,
      })
    );
    expect(repo.count).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'test',
        statuses: ['draft'],
        numberKind: OpusNumberKind.Woo,
      })
    );
    expect(compositionsRepo.count).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'test',
        statuses: ['draft'],
        isStandalone: true,
      })
    );
  });
});
