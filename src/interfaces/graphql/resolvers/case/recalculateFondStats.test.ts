import { recalculateFondStats } from './recalculateFondStats';
import { ICaseRepository } from '~/src/domain/repositories/caseRepository';
import { IFondRepository } from '~/src/domain/repositories/fondRepository';

const mockFondId = '65eddf5e2f1a2b3c4d5e6f7b';

const mockCount = jest.fn();
const mockCountDistinctDescriptionNumbers = jest.fn();
const mockFondUpdate = jest.fn();

const mockCaseRepo: Partial<ICaseRepository> = {
  count: mockCount,
  countDistinctDescriptionNumbers: mockCountDistinctDescriptionNumbers
};

const mockFondRepo: Partial<IFondRepository> = {
  update: mockFondUpdate
};

describe('recalculateFondStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should recalculate casesCount and descriptionsCount and persist them on the Fond', async () => {
    mockCount.mockResolvedValue(4);
    mockCountDistinctDescriptionNumbers.mockResolvedValue(2);

    await recalculateFondStats(mockFondId, {
      caseRepository: mockCaseRepo as ICaseRepository,
      fondRepository: mockFondRepo as IFondRepository
    });

    expect(mockCount).toHaveBeenCalledWith({ fondId: mockFondId });
    expect(mockCountDistinctDescriptionNumbers).toHaveBeenCalledWith(mockFondId);
    expect(mockFondUpdate).toHaveBeenCalledWith(mockFondId, {
      casesCount: 4,
      descriptionsCount: 2
    });
  });

  it('should persist zero counts when the fond has no remaining cases', async () => {
    mockCount.mockResolvedValue(0);
    mockCountDistinctDescriptionNumbers.mockResolvedValue(0);

    await recalculateFondStats(mockFondId, {
      caseRepository: mockCaseRepo as ICaseRepository,
      fondRepository: mockFondRepo as IFondRepository
    });

    expect(mockFondUpdate).toHaveBeenCalledWith(mockFondId, {
      casesCount: 0,
      descriptionsCount: 0
    });
  });

  it('should propagate errors from the fond repository update', async () => {
    mockCount.mockResolvedValue(1);
    mockCountDistinctDescriptionNumbers.mockResolvedValue(1);
    mockFondUpdate.mockRejectedValue(new Error('DB unavailable'));

    await expect(
      recalculateFondStats(mockFondId, {
        caseRepository: mockCaseRepo as ICaseRepository,
        fondRepository: mockFondRepo as IFondRepository
      })
    ).rejects.toThrow('DB unavailable');
  });
});
