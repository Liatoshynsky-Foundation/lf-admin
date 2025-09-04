import { act, renderHook } from '@testing-library/react';

import { useHasUnsavedChanges } from '../use-has-unsaved-changes/useHasUnsavedChanges';
import { useStayPage } from './useStayPage';

const pushMock = jest.fn();
let pathnameMock = '/';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock
}));

jest.mock('../use-has-unsaved-changes/useHasUnsavedChanges');

const mockedUseHasUnsavedChanges = jest.mocked(useHasUnsavedChanges);
describe('useStayPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pathnameMock = '/';
  });

  it('should not block navigation when hasUnsavedChanges = false', () => {
    mockedUseHasUnsavedChanges.mockReturnValue(false);

    const { result, rerender } = renderHook(() => useStayPage());

    act(() => {
      pathnameMock = '/next';
      rerender();
    });

    expect(result.current.pendingPath).toBe(null);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('should block navigation when hasUnsavedChanges = true', () => {
    mockedUseHasUnsavedChanges.mockReturnValue(true);

    const { result, rerender } = renderHook(() => useStayPage());

    act(() => {
      pathnameMock = '/next';
      rerender();
    });

    expect(result.current.pendingPath).toBe('/next');
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('should confirm navigation and go to pending path', () => {
    mockedUseHasUnsavedChanges.mockReturnValue(true);

    const { result, rerender } = renderHook(() => useStayPage());

    act(() => {
      pathnameMock = '/next';
      rerender();
    });

    expect(result.current.pendingPath).toBe('/next');

    act(() => {
      result.current.confirmNavigation();
    });

    expect(pushMock).toHaveBeenCalledWith('/next');
    expect(result.current.pendingPath).toBe(null);
  });

  it('should cancel navigation and clear pendingPath', () => {
    mockedUseHasUnsavedChanges.mockReturnValue(true);

    const { result, rerender } = renderHook(() => useStayPage());

    pathnameMock = '/next';
    rerender();

    expect(result.current.pendingPath).toBe('/next');

    act(() => {
      result.current.cancelNavigation();
    });
    expect(pushMock).toHaveBeenCalledWith('/');
  });
});
