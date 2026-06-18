import { renderHook } from '@testing-library/react';
import { usePathname, useRouter } from 'next/navigation';

import { useNavigationGuard } from './useNavigationGuard';
import { useStore } from '~/store';

jest.mock('~/store');
jest.mock('next/navigation');

const mockedUseStore = jest.mocked(useStore);
const mockedUsePathname = jest.mocked(usePathname);
const mockedUseRouter = jest.mocked(useRouter);

describe('useNavigationGuard', () => {
  const push = jest.fn();
  const setPendingNavigation = jest.fn();
  const setDiscardModalOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUsePathname.mockReturnValue('/page1');

    mockedUseRouter.mockReturnValue({
      push
    } as any);
  });

  it('should navigate directly when page is not dirty', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector({
        dirtyPaths: {},
        setPendingNavigation,
        setDiscardModalOpen
      } as any)
    );

    const { result } = renderHook(() => useNavigationGuard());

    result.current.navigate('/target');

    expect(push).toHaveBeenCalledWith('/target');
    expect(setPendingNavigation).not.toHaveBeenCalled();
    expect(setDiscardModalOpen).not.toHaveBeenCalled();
  });

  it('should open discard modal when page is dirty', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector({
        dirtyPaths: {
          '/page1': true
        },
        setPendingNavigation,
        setDiscardModalOpen
      } as any)
    );

    const { result } = renderHook(() => useNavigationGuard());

    result.current.navigate('/target');

    expect(push).not.toHaveBeenCalled();
    expect(setPendingNavigation).toHaveBeenCalledWith('/target');
    expect(setDiscardModalOpen).toHaveBeenCalledWith(true);
  });

  it('should not open discard modal when another route is dirty', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector({
        dirtyPaths: {
          '/page2': true
        },
        setPendingNavigation,
        setDiscardModalOpen
      } as any)
    );

    const { result } = renderHook(() => useNavigationGuard());

    result.current.navigate('/target');

    expect(push).toHaveBeenCalledWith('/target');
    expect(setPendingNavigation).not.toHaveBeenCalled();
    expect(setDiscardModalOpen).not.toHaveBeenCalled();
  });

  it('should not prevent link click when page is not dirty', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector({
        dirtyPaths: {},
        setPendingNavigation,
        setDiscardModalOpen
      } as any)
    );

    const preventDefault = jest.fn();

    const { result } = renderHook(() => useNavigationGuard());

    result.current.interceptLinkClick({ preventDefault } as unknown as React.MouseEvent<HTMLAnchorElement>, '/target');

    expect(preventDefault).not.toHaveBeenCalled();
    expect(setPendingNavigation).not.toHaveBeenCalled();
    expect(setDiscardModalOpen).not.toHaveBeenCalled();
  });

  it('should prevent link click and open discard modal when page is dirty', () => {
    mockedUseStore.mockImplementation((selector) =>
      selector({
        dirtyPaths: {
          '/page1': true
        },
        setPendingNavigation,
        setDiscardModalOpen
      } as any)
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
      selector({
        dirtyPaths: {
          '/page2': true
        },
        setPendingNavigation,
        setDiscardModalOpen
      } as any)
    );

    const preventDefault = jest.fn();

    const { result } = renderHook(() => useNavigationGuard());

    result.current.interceptLinkClick({ preventDefault } as unknown as React.MouseEvent<HTMLAnchorElement>, '/target');

    expect(preventDefault).not.toHaveBeenCalled();
    expect(setPendingNavigation).not.toHaveBeenCalled();
    expect(setDiscardModalOpen).not.toHaveBeenCalled();
  });
});
