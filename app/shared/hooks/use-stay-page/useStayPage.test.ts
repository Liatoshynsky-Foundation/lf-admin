import { act, renderHook } from '@testing-library/react';

import { useStayPage } from './useStayPage';

const pushMock = jest.fn();
let pathnameMock = '/';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock
}));

describe('useStayPage', () => {
  beforeEach(() => {
    pathnameMock = '/';
    pushMock.mockClear();
  });

  it('should not block navigation when shouldBlock = false', () => {
    const { result, rerender } = renderHook(({ shouldBlock }) => useStayPage(shouldBlock), {
      initialProps: { shouldBlock: false }
    });

    pathnameMock = '/new-path';
    rerender({ shouldBlock: false });

    expect(result.current.pendingPath).toBe(null);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('should block navigation when shouldBlock = true', () => {
    const { result, rerender } = renderHook(({ shouldBlock }) => useStayPage(shouldBlock), {
      initialProps: { shouldBlock: true }
    });

    pathnameMock = '/new-path';
    rerender({ shouldBlock: true });

    expect(result.current.pendingPath).toBe('/new-path');
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('should confirm navigation', () => {
    const { result, rerender } = renderHook(({ shouldBlock }) => useStayPage(shouldBlock), {
      initialProps: { shouldBlock: true }
    });

    pathnameMock = '/new-path';
    rerender({ shouldBlock: true });

    act(() => {
      result.current.confirmNavigation();
    });

    expect(pushMock).toHaveBeenCalledWith('/new-path');
    expect(result.current.pendingPath).toBe(null);
  });

  it('should cancel navigation', () => {
    const { result, rerender } = renderHook(({ shouldBlock }) => useStayPage(shouldBlock), {
      initialProps: { shouldBlock: true }
    });

    pathnameMock = '/new-path';
    rerender({ shouldBlock: true });

    act(() => {
      result.current.cancelNavigation();
    });

    expect(pushMock).toHaveBeenCalledWith('/');
  });
});
