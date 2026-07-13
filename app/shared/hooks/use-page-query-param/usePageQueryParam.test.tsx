import { renderHook, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';

import { usePageQueryParam } from './usePageQueryParam';

const mockReplace = jest.fn();
const mockPathname = 'mockPathname';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace
  }),
  usePathname: () => mockPathname,
  useSearchParams: jest.fn()
}));

describe('usePageQueryParam', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => key,
      toString: () => ''
    });
  });

  it('should return valid page', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => key === 'page' ? '2' : null
    });
    const { result } = renderHook(() => usePageQueryParam({ totalPages: 10 }));

    await waitFor(() => {
      expect(result.current.page).toBe(2);
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it('should return transform invalid page and return valid with redirect to valid URL', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => key === 'page' ? 'test-string' : null
    });
    const { result } = renderHook(() => usePageQueryParam({ totalPages: 10 }));

    await waitFor(() => {
      expect(result.current.page).toBe(1);
      expect(mockReplace).toHaveBeenCalled();
    });
  });

  it.each([
    { 
      queryPage: '0', 
      totalPages: 10, 
      expected: 1, 
      description: 'clip page to 1 if page < 1' 
    },
    { 
      queryPage: '110', 
      totalPages: 10, 
      expected: 10, 
      description: 'clip page to totalPages if page > totalPages' 
    }
  ])('should $description', async ({ queryPage, totalPages, expected }) => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => key === 'page' ? queryPage : null,
      toString: () => ''
    });

    const { result } = renderHook(() => usePageQueryParam({ totalPages }));

    await waitFor(() => {
      expect(result.current.page).toBe(expected);
      expect(mockReplace).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith(`${mockPathname}?page=${expected}`);
    });
  });
});
