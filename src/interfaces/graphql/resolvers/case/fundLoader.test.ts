import { createFundLoader } from './fundLoader';
import { IFundRepository } from '~/src/domain/repositories/fundRepository';

const mockFindByIds = jest.fn();

const mockFundRepo: Partial<IFundRepository> = {
  findByIds: mockFindByIds
};

describe('createFundLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should batch multiple .load() calls issued in the same tick into a single findByIds call', async () => {
    mockFindByIds.mockResolvedValue([
      { id: 'fund-1', fundNumber: 1 },
      { id: 'fund-2', fundNumber: 2 }
    ]);

    const loader = createFundLoader({ fundRepository: mockFundRepo as IFundRepository });

    const [fund1, fund2] = await Promise.all([loader.load('fund-1'), loader.load('fund-2')]);

    expect(mockFindByIds).toHaveBeenCalledTimes(1);
    expect(mockFindByIds).toHaveBeenCalledWith(['fund-1', 'fund-2']);
    expect(fund1).toEqual({ id: 'fund-1', fundNumber: 1 });
    expect(fund2).toEqual({ id: 'fund-2', fundNumber: 2 });
  });

  it('should deduplicate repeated ids within the same batch (e.g. many Cases sharing one Fund)', async () => {
    mockFindByIds.mockResolvedValue([{ id: 'fund-1', fundNumber: 1 }]);

    const loader = createFundLoader({ fundRepository: mockFundRepo as IFundRepository });

    const results = await Promise.all([
      loader.load('fund-1'),
      loader.load('fund-1'),
      loader.load('fund-1')
    ]);

    expect(mockFindByIds).toHaveBeenCalledTimes(1);
    expect(mockFindByIds).toHaveBeenCalledWith(['fund-1']);
    expect(results).toEqual([
      { id: 'fund-1', fundNumber: 1 },
      { id: 'fund-1', fundNumber: 1 },
      { id: 'fund-1', fundNumber: 1 }
    ]);
  });

  it('should cache results across separate .load() calls for the lifetime of the loader instance', async () => {
    mockFindByIds.mockResolvedValue([{ id: 'fund-1', fundNumber: 1 }]);

    const loader = createFundLoader({ fundRepository: mockFundRepo as IFundRepository });

    await loader.load('fund-1');
    await loader.load('fund-1');

    expect(mockFindByIds).toHaveBeenCalledTimes(1);
  });

  it('should resolve null for ids that findByIds did not return (e.g. a stale/broken fundId)', async () => {
    mockFindByIds.mockResolvedValue([{ id: 'fund-1', fundNumber: 1 }]);

    const loader = createFundLoader({ fundRepository: mockFundRepo as IFundRepository });

    const [fund1, missing] = await Promise.all([loader.load('fund-1'), loader.load('missing-fund')]);

    expect(fund1).toEqual({ id: 'fund-1', fundNumber: 1 });
    expect(missing).toBeNull();
  });

  it('should NOT share a cache between two separate loader instances (per-request isolation)', async () => {
    mockFindByIds.mockResolvedValue([{ id: 'fund-1', fundNumber: 1 }]);

    const requestOneLoader = createFundLoader({ fundRepository: mockFundRepo as IFundRepository });
    const requestTwoLoader = createFundLoader({ fundRepository: mockFundRepo as IFundRepository });

    await requestOneLoader.load('fund-1');
    await requestTwoLoader.load('fund-1');

    expect(mockFindByIds).toHaveBeenCalledTimes(2);
  });
});
