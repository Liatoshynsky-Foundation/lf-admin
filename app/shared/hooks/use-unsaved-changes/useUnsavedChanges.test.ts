import { renderHook } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import { useUnsavedChanges } from './useUnsavedChanges';
import { useStore } from '~/store';
import type { StoreState } from '~/store/types';

jest.mock('~/store');
jest.mock('next/navigation');

const mockedUseStore = jest.mocked(useStore);
const mockedUsePathname = jest.mocked(usePathname);

describe('useUnsavedChanges', () => {
  const setDirtyPath = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUsePathname.mockReturnValue('/publications');

    const storeState: Pick<StoreState, 'setDirtyPath'> = { setDirtyPath };

    mockedUseStore.mockImplementation((selector) => selector(storeState as StoreState));
  });

  it('should set dirty path on mount', () => {
    renderHook(() => useUnsavedChanges(true));

    expect(setDirtyPath).toHaveBeenCalledWith('/publications', true);
  });

  it('should update dirty path when hasUnsavedChanges changes', () => {
    const { rerender } = renderHook(({ hasUnsavedChanges }) => useUnsavedChanges(hasUnsavedChanges), {
      initialProps: {
        hasUnsavedChanges: false
      }
    });

    expect(setDirtyPath).toHaveBeenCalledWith('/publications', false);

    rerender({
      hasUnsavedChanges: true
    });

    expect(setDirtyPath).toHaveBeenCalledWith('/publications', true);
  });

  it('should clear dirty path on unmount', () => {
    const { unmount } = renderHook(() => useUnsavedChanges(true));

    setDirtyPath.mockClear();

    unmount();

    expect(setDirtyPath).toHaveBeenCalledWith('/publications', false);
  });
});
