import { createFondLoader } from './fondLoader';
import { IFondRepository } from '~/src/domain/repositories/fondRepository';

const mockFindByIds = jest.fn();

const mockFondRepo: Partial<IFondRepository> = {
  findByIds: mockFindByIds
};

describe('createFondLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should batch multiple .load() calls issued in the same tick into a single findByIds call', async () => {
    mockFindByIds.mockResolvedValue([
      { id: 'fond-1', fondNumber: 1 },
      { id: 'fond-2', fondNumber: 2 }
    ]);

    const loader = createFondLoader({ fondRepository: mockFondRepo as IFondRepository });

    const [fond1, fond2] = await Promise.all([loader.load('fond-1'), loader.load('fond-2')]);

    expect(mockFindByIds).toHaveBeenCalledTimes(1);
    expect(mockFindByIds).toHaveBeenCalledWith(['fond-1', 'fond-2']);
    expect(fond1).toEqual({ id: 'fond-1', fondNumber: 1 });
    expect(fond2).toEqual({ id: 'fond-2', fondNumber: 2 });
  });

  it('should deduplicate repeated ids within the same batch (e.g. many Cases sharing one Fond)', async () => {
    mockFindByIds.mockResolvedValue([{ id: 'fond-1', fondNumber: 1 }]);

    const loader = createFondLoader({ fondRepository: mockFondRepo as IFondRepository });

    const results = await Promise.all([
      loader.load('fond-1'),
      loader.load('fond-1'),
      loader.load('fond-1')
    ]);

    expect(mockFindByIds).toHaveBeenCalledTimes(1);
    expect(mockFindByIds).toHaveBeenCalledWith(['fond-1']);
    expect(results).toEqual([
      { id: 'fond-1', fondNumber: 1 },
      { id: 'fond-1', fondNumber: 1 },
      { id: 'fond-1', fondNumber: 1 }
    ]);
  });

  it('should cache results across separate .load() calls for the lifetime of the loader instance', async () => {
    mockFindByIds.mockResolvedValue([{ id: 'fond-1', fondNumber: 1 }]);

    const loader = createFondLoader({ fondRepository: mockFondRepo as IFondRepository });

    await loader.load('fond-1');
    await loader.load('fond-1');

    expect(mockFindByIds).toHaveBeenCalledTimes(1);
  });

  it('should resolve null for ids that findByIds did not return (e.g. a stale/broken fondId)', async () => {
    mockFindByIds.mockResolvedValue([{ id: 'fond-1', fondNumber: 1 }]);

    const loader = createFondLoader({ fondRepository: mockFondRepo as IFondRepository });

    const [fond1, missing] = await Promise.all([loader.load('fond-1'), loader.load('missing-fond')]);

    expect(fond1).toEqual({ id: 'fond-1', fondNumber: 1 });
    expect(missing).toBeNull();
  });

  it('should NOT share a cache between two separate loader instances (per-request isolation)', async () => {
    mockFindByIds.mockResolvedValue([{ id: 'fond-1', fondNumber: 1 }]);

    const requestOneLoader = createFondLoader({ fondRepository: mockFondRepo as IFondRepository });
    const requestTwoLoader = createFondLoader({ fondRepository: mockFondRepo as IFondRepository });

    await requestOneLoader.load('fond-1');
    await requestTwoLoader.load('fond-1');

    expect(mockFindByIds).toHaveBeenCalledTimes(2);
  });
});
