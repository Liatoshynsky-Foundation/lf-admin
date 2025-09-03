import { renderHook } from '@testing-library/react';

import { useHasUnsavedChanges } from './useHasUnsavedChanges';
import { useStore } from '~/store';

jest.mock('~/store');
const mockedUseStore = jest.mocked(useStore);
describe('useHasUnsavedChanges', () => {
  it('should return false when isChanged = false', () => {
    mockedUseStore.mockImplementation((selector) => selector({ isChanged: false, blocks: {} } as any));

    const { result } = renderHook(() => useHasUnsavedChanges('/page1'));
    expect(result.current).toBe(false);
  });

  it('should return false when isChanged = true but no blocks', () => {
    mockedUseStore.mockImplementation((selector) => selector({ isChanged: true, blocks: {} } as any));

    const { result } = renderHook(() => useHasUnsavedChanges('/page1'));
    expect(result.current).toBe(false);
  });

  it('should return true when isChanged = true and block exists for route', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector({ isChanged: true, blocks: { page1: { some: 'data' } } } as any)
    );

    const { result } = renderHook(() => useHasUnsavedChanges('/page1'));
    expect(result.current).toBe(true);
  });

  it('should return false when block exists but isChanged = false', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector({ isChanged: false, blocks: { page1: { some: 'data' } } } as any)
    );

    const { result } = renderHook(() => useHasUnsavedChanges('/page1'));
    expect(result.current).toBe(false);
  });
});
