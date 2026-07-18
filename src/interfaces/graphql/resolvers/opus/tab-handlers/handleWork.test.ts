import { mapFilters } from '../../helpers';
import { WorksFilter } from '../opusQuery';
import { handleWorksTab } from './handleWork';
import { Composition } from '~/src/domain/entities/Composition';
import type { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';

jest.mock('../../helpers', () => ({
  mapFilters: jest.fn(),
}));

describe('handleWorks', () => {
  const compositionsRepo = {
    count: jest.fn(),
    findAll: jest.fn(),
  } as unknown as jest.Mocked<ICompositionRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should map filters and return paginated works', async () => {
    (mapFilters as jest.Mock).mockReturnValue({
      search: 'test',
    });
    const work = {
      id: '1',
	  title: { en: 'Test Work' },
	  createdAt: new Date().toISOString(),
	  updatedAt: new Date().toISOString(),
    } as Composition;

    compositionsRepo.findAll.mockResolvedValue([work]);
    compositionsRepo.count.mockResolvedValue(15);

    const result = await handleWorksTab(
      compositionsRepo,
      { search: 'test' } as WorksFilter, 2, 10 
    );

    expect(compositionsRepo.count).toHaveBeenCalledWith({
      search: 'test',
      isStandalone: true,
    });

    expect(compositionsRepo.findAll).toHaveBeenCalledWith({
      search: 'test',
      isStandalone: true,
    });

    expect(result).toEqual({
      groups: [],
      works: [work],
      total: 15,
      page: 2,
      totalPages: 2,
    });
  });

  it('should work without filters', async () => {
    (mapFilters as jest.Mock).mockReturnValue(undefined);

    compositionsRepo.count.mockResolvedValue(0);
    compositionsRepo.findAll.mockResolvedValue([]);

    const result = await handleWorksTab(
      compositionsRepo,
      undefined,
      1,
      10
    );

    expect(compositionsRepo.count).toHaveBeenCalledWith({
      isStandalone: true,
    });

    expect(compositionsRepo.findAll).toHaveBeenCalledWith({
      isStandalone: true,
    });

    expect(result).toEqual({
      groups: [],
      works: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
  });
});
