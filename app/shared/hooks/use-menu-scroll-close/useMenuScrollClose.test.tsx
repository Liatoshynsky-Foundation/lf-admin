import { act, renderHook } from '@testing-library/react';

import { useMenuScrollClose } from './useMenuScrollClose';

describe('useMenuScrollClose', () => {
  const mockOnClose = jest.fn();
  let mockAnchorEl: HTMLElement;
  let addEventListenerSpy: jest.SpiedFunction<typeof window.addEventListener>;
  let removeEventListenerSpy: jest.SpiedFunction<typeof window.removeEventListener>;

  beforeEach(() => {
    mockAnchorEl = document.createElement('div');

    jest.spyOn(mockAnchorEl, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      bottom: 250,
      left: 0,
      right: 0,
      width: 50,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return initial values when menu is closed and not add listener', () => {
    const { result } = renderHook(() => useMenuScrollClose({ onClose: mockOnClose, anchorEl: null }));

    expect(result.current.disableTransition).toBe(false);
    expect(typeof result.current.handleClose).toBe('function');
    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should add scroll listener when anchorEl is provided (menu opens)', () => {
    renderHook(() => useMenuScrollClose({ onClose: mockOnClose, anchorEl: mockAnchorEl }));

    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
  });

  it('should call onClose and reset disableTransition when handleClose is invoked', () => {
    const { result } = renderHook(() => useMenuScrollClose({ onClose: mockOnClose, anchorEl: mockAnchorEl }));

    act(() => {
      result.current.handleClose();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(result.current.disableTransition).toBe(false);
  });

  it('should not trigger onClose on scroll if anchorEl is still visible on screen', () => {
    renderHook(() => useMenuScrollClose({ onClose: mockOnClose, anchorEl: mockAnchorEl }));

    const handleScroll = addEventListenerSpy.mock.calls[0][1] as EventListener;

    jest.spyOn(mockAnchorEl, 'getBoundingClientRect').mockReturnValueOnce({
      top: 150,
      bottom: 200,
      left: 0,
      right: 0,
      width: 50,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    act(() => {
      handleScroll(new Event('scroll'));
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should trigger onClose and set disableTransition to true when anchorEl is scrolled completely above the viewport', () => {
    const { result, rerender } = renderHook(
      ({ anchor }) => useMenuScrollClose({ onClose: mockOnClose, anchorEl: anchor }),
      { initialProps: { anchor: mockAnchorEl as HTMLElement | null } }
    );

    const handleScroll = addEventListenerSpy.mock.calls[0][1] as EventListener;

    jest.spyOn(mockAnchorEl, 'getBoundingClientRect').mockReturnValueOnce({
      top: -60,
      bottom: -10,
      left: 0,
      right: 0,
      width: 50,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    act(() => {
      handleScroll(new Event('scroll'));
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    rerender({ anchor: mockAnchorEl });
    expect(result.current.disableTransition).toBe(true);
  });

  it('should trigger onClose when anchorEl is scrolled completely above the viewport', () => {
    renderHook(() => useMenuScrollClose({ onClose: mockOnClose, anchorEl: mockAnchorEl }));

    jest.spyOn(mockAnchorEl, 'getBoundingClientRect').mockReturnValueOnce({
      top: -60,
      bottom: -10,
      left: 0,
      right: 0,
      width: 50,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should reset disableTransition to false when open state changes to false', () => {
    const { result, rerender } = renderHook(
      ({ anchor }) => useMenuScrollClose({ onClose: mockOnClose, anchorEl: anchor }),
      { initialProps: { anchor: mockAnchorEl as HTMLElement | null } }
    );

    const handleScroll = addEventListenerSpy.mock.calls[0][1] as EventListener;

    jest.spyOn(mockAnchorEl, 'getBoundingClientRect').mockReturnValueOnce({
      top: -60,
      bottom: -10,
      left: 0,
      right: 0,
      width: 50,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    act(() => {
      handleScroll(new Event('scroll'));
    });

    rerender({ anchor: mockAnchorEl });
    expect(result.current.disableTransition).toBe(true);

    rerender({ anchor: null });
    rerender({ anchor: null });

    expect(result.current.disableTransition).toBe(false);
  });

  it('should clean up the scroll event listener on unmount', () => {
    const { unmount } = renderHook(() => useMenuScrollClose({ onClose: mockOnClose, anchorEl: mockAnchorEl }));
    const registeredHandler = addEventListenerSpy.mock.calls[0][1];

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', registeredHandler, true);
  });
});
