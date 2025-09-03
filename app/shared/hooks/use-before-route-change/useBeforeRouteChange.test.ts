import { renderHook } from '@testing-library/react';

import { useBeforeRouteChange } from './useBeforeRouteChange';

let pathnameMock = '/initial';

jest.mock('next/navigation', () => ({
  usePathname: () => pathnameMock
}));

describe('useBeforeRouteChange', () => {
  beforeEach(() => {
    pathnameMock = '/initial'; // reset pathname
    jest.clearAllMocks(); // reset mock calls
  });

  it('should not call callback on initial render', () => {
    const cb = jest.fn();
    renderHook(() => useBeforeRouteChange(cb));
    expect(cb).not.toHaveBeenCalled();
  });

  it('should call callback when pathname changes', () => {
    const cb = jest.fn();
    const { rerender } = renderHook(() => useBeforeRouteChange(cb));

    pathnameMock = '/new-path';
    rerender();

    expect(cb).toHaveBeenCalledWith('/initial', '/new-path');
  });

  it('should update prevPath after change', () => {
    const cb = jest.fn();
    const { rerender } = renderHook(() => useBeforeRouteChange(cb));

    pathnameMock = '/first';
    rerender();
    expect(cb).toHaveBeenCalledWith('/initial', '/first');

    pathnameMock = '/second';
    rerender();
    expect(cb).toHaveBeenCalledWith('/first', '/second');
  });

  it('should call callback multiple times for multiple changes', () => {
    const cb = jest.fn();
    const { rerender } = renderHook(() => useBeforeRouteChange(cb));

    pathnameMock = '/step1';
    rerender();

    pathnameMock = '/step2';
    rerender();

    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenNthCalledWith(1, '/initial', '/step1');
    expect(cb).toHaveBeenNthCalledWith(2, '/step1', '/step2');
  });
});
