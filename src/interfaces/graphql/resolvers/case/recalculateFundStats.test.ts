import { recalculateFundStats } from './recalculateFundStats';
import { ICaseRepository } from '~/src/domain/repositories/caseRepository';
import { IFundRepository } from '~/src/domain/repositories/fundRepository';

const mockFundId = '65eddf5e2f1a2b3c4d5e6f7b';

const mockCount = jest.fn();
const mockCountDistinctDescriptionNumbers = jest.fn();
const mockFundUpdate = jest.fn();

const mockCaseRepo: Partial<ICaseRepository> = {
  count: mockCount,
  countDistinctDescriptionNumbers: mockCountDistinctDescriptionNumbers
};

const mockFundRepo: Partial<IFundRepository> = {
  update: mockFundUpdate
};

describe('recalculateFundStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should recalculate casesCount and descriptionsCount and persist them on the Fund', async () => {
    mockCount.mockResolvedValue(4);
    mockCountDistinctDescriptionNumbers.mockResolvedValue(2);

    await recalculateFundStats(mockFundId, {
      caseRepository: mockCaseRepo as ICaseRepository,
      fundRepository: mockFundRepo as IFundRepository
    });

    expect(mockCount).toHaveBeenCalledWith({ fundId: mockFundId });
    expect(mockCountDistinctDescriptionNumbers).toHaveBeenCalledWith(mockFundId);
    expect(mockFundUpdate).toHaveBeenCalledWith(mockFundId, {
      casesCount: 4,
      descriptionsCount: 2
    });
  });

  it('should persist zero counts when the fund has no remaining cases', async () => {
    mockCount.mockResolvedValue(0);
    mockCountDistinctDescriptionNumbers.mockResolvedValue(0);

    await recalculateFundStats(mockFundId, {
      caseRepository: mockCaseRepo as ICaseRepository,
      fundRepository: mockFundRepo as IFundRepository
    });

    expect(mockFundUpdate).toHaveBeenCalledWith(mockFundId, {
      casesCount: 0,
      descriptionsCount: 0
    });
  });

  it('should propagate errors from the fund repository update', async () => {
    mockCount.mockResolvedValue(1);
    mockCountDistinctDescriptionNumbers.mockResolvedValue(1);
    mockFundUpdate.mockRejectedValue(new Error('DB unavailable'));

    await expect(
      recalculateFundStats(mockFundId, {
        caseRepository: mockCaseRepo as ICaseRepository,
        fundRepository: mockFundRepo as IFundRepository
      })
    ).rejects.toThrow('DB unavailable');
  });
});
