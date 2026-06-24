import { renderHook } from '@testing-library/react';
import { usePathname, useRouter } from 'next/navigation';

import { useNavigationGuard } from './useNavigationGuard';
import { BACK_NAVIGATION } from '~/constants/navigation';
import { useStore } from '~/store';
import type { StoreState } from '~/store/types';

jest.mock('~/store');
jest.mock('next/navigation');

const mockedUseStore = jest.mocked(useStore);
const mockedUsePathname = jest.mocked(usePathname);
const mockedUseRouter = jest.mocked(useRouter);

describe('useNavigationGuard', () => {
  const push = jest.fn();
  const back = jest.fn();
  const setPendingNavigation = jest.fn();
  const setDiscardModalOpen = jest.fn();

  const mockStore = (dirtyPaths: Record<string, boolean> = {}): StoreState =>
    ({
      dirtyPaths,
      setPendingNavigation,
      setDiscardModalOpen
    }) as unknown as StoreState;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUsePathname.mockReturnValue('/page1');

    const mockRouter: Partial<ReturnType<typeof useRouter>> = {
      push,
      back
    };

    mockedUseRouter.mockReturnValue(mockRouter as ReturnType<typeof useRouter>);
  });

  it('should navigate directly when page is not dirty', () => {
    mockedUseStore.mockImplementation((selector) => selector(mockStore()));

    const { result } = renderHook(() => useNavigationGuard());

    result.current.navigate('/target');

    expect(push).toHaveBeenCalledWith('/target');
    expect(setPendingNavigation).not.toHaveBeenCalled();
    expect(setDiscardModalOpen).not.toHaveBeenCalled();
  });

  it('should open discard modal when page is dirty', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector(
        mockStore({
          '/page1': true
        })
      )
    );

    const { result } = renderHook(() => useNavigationGuard());

    result.current.navigate('/target');

    expect(push).not.toHaveBeenCalled();
    expect(setPendingNavigation).toHaveBeenCalledWith('/target');
    expect(setDiscardModalOpen).toHaveBeenCalledWith(true);
  });

  it('should not open discard modal when another route is dirty', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector(
        mockStore({
          '/page2': true
        })
      )
    );

    const { result } = renderHook(() => useNavigationGuard());

    result.current.navigate('/target');

    expect(push).toHaveBeenCalledWith('/target');
    expect(setPendingNavigation).not.toHaveBeenCalled();
    expect(setDiscardModalOpen).not.toHaveBeenCalled();
  });

  it('should not prevent link click when page is not dirty', () => {
    mockedUseStore.mockImplementation((selector) => selector(mockStore()));

    const preventDefault = jest.fn();

    const { result } = renderHook(() => useNavigationGuard());

    result.current.interceptLinkClick({ preventDefault } as unknown as React.MouseEvent<HTMLAnchorElement>, '/target');

    expect(preventDefault).not.toHaveBeenCalled();
    expect(setPendingNavigation).not.toHaveBeenCalled();
    expect(setDiscardModalOpen).not.toHaveBeenCalled();
  });

  it('should prevent link click and open discard modal when page is dirty', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector(
        mockStore({
          '/page1': true
        })
      )
    );

    const preventDefault = jest.fn();

    const { result } = renderHook(() => useNavigationGuard());

    result.current.interceptLinkClick({ preventDefault } as unknown as React.MouseEvent<HTMLAnchorElement>, '/target');

    expect(preventDefault).toHaveBeenCalled();
    expect(setPendingNavigation).toHaveBeenCalledWith('/target');
    expect(setDiscardModalOpen).toHaveBeenCalledWith(true);
  });

  it('should not intercept link click when another route is dirty', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector(
        mockStore({
          '/page2': true
        })
      )
    );

    const preventDefault = jest.fn();

    const { result } = renderHook(() => useNavigationGuard());

    result.current.interceptLinkClick({ preventDefault } as unknown as React.MouseEvent<HTMLAnchorElement>, '/target');

    expect(preventDefault).not.toHaveBeenCalled();
    expect(setPendingNavigation).not.toHaveBeenCalled();
    expect(setDiscardModalOpen).not.toHaveBeenCalled();
  });

  it('should navigate back directly when page is not dirty', () => {
    mockedUseStore.mockImplementation((selector) => selector(mockStore()));

    const { result } = renderHook(() => useNavigationGuard());

    result.current.navigateBack();

    expect(back).toHaveBeenCalled();
    expect(setPendingNavigation).not.toHaveBeenCalled();
    expect(setDiscardModalOpen).not.toHaveBeenCalled();
  });

  it('should open discard modal when navigating back from dirty page', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector(
        mockStore({
          '/page1': true
        })
      )
    );

    const { result } = renderHook(() => useNavigationGuard());

    result.current.navigateBack();

    expect(back).not.toHaveBeenCalled();
    expect(setPendingNavigation).toHaveBeenCalledWith(BACK_NAVIGATION);
    expect(setDiscardModalOpen).toHaveBeenCalledWith(true);
  });
});
