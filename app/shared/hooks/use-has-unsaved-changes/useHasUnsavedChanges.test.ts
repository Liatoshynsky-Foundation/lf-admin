import { renderHook } from '@testing-library/react';

import { useHasUnsavedChanges } from './useHasUnsavedChanges';
import { useStore } from '~/store';

jest.mock('~/store');
const mockedUseStore = jest.mocked(useStore);
describe('useHasUnsavedChanges', () => {
  it('should return false when route is not dirty', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector({
        dirtyPaths: {}
      } as any)
    );

    const { result } = renderHook(() => useHasUnsavedChanges('/page1'));

    expect(result.current).toBe(false);
  });

  it('should return true when route is dirty', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector({
        dirtyPaths: {
          '/page1': true
        }
      } as any)
    );

    const { result } = renderHook(() => useHasUnsavedChanges('/page1'));

    expect(result.current).toBe(true);
  });

  it('should return false when another route is dirty', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector({
        dirtyPaths: {
          '/page2': true
        }
      } as any)
    );

    const { result } = renderHook(() => useHasUnsavedChanges('/page1'));

    expect(result.current).toBe(false);
  });

  it('should return false when route is not present in dirtyPaths', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector({
        dirtyPaths: {
          '/page2': false
        }
      } as any)
    );

    const { result } = renderHook(() => useHasUnsavedChanges('/page1'));

    expect(result.current).toBe(false);
  });
});
