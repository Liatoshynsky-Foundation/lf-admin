import { renderHook } from '@testing-library/react';

import { useFundPublishWarning } from './useFundPublishWarning';

const mockHasPublishedCasesInFund = jest.fn();

jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  __esModule: true,
  useHasPublishedCasesInFund: () => mockHasPublishedCasesInFund
}));

describe('useFundPublishWarning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show the warning without querying when the fund has no cases', async () => {
    const { result } = renderHook(() => useFundPublishWarning());

    await expect(result.current({ fundId: 'fund-1', casesCount: 0 })).resolves.toBe('show-warning');
    expect(mockHasPublishedCasesInFund).not.toHaveBeenCalled();
  });

  it('should allow publishing a new fund with cases before it has an id', async () => {
    const { result } = renderHook(() => useFundPublishWarning());

    await expect(result.current({ casesCount: 1 })).resolves.toBe('publish');
    expect(mockHasPublishedCasesInFund).not.toHaveBeenCalled();
  });

  it('should allow publishing when the fund has published cases', async () => {
    mockHasPublishedCasesInFund.mockResolvedValue(true);
    const { result } = renderHook(() => useFundPublishWarning());

    await expect(result.current({ fundId: 'fund-1', casesCount: 1 })).resolves.toBe('publish');
    expect(mockHasPublishedCasesInFund).toHaveBeenCalledWith('fund-1');
  });

  it('should show the warning when the fund has cases but none are published', async () => {
    mockHasPublishedCasesInFund.mockResolvedValue(false);
    const { result } = renderHook(() => useFundPublishWarning());

    await expect(result.current({ fundId: 'fund-1', casesCount: 1 })).resolves.toBe('show-warning');
  });

  it('should return error when the published cases check fails', async () => {
    mockHasPublishedCasesInFund.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useFundPublishWarning());

    await expect(result.current({ fundId: 'fund-1', casesCount: 1 })).resolves.toBe('error');
  });
});
