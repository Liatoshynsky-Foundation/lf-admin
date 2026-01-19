import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { useZoomPan } from './useZoomPan';

function mouseEvent(overrides: Partial<React.MouseEvent> = {}): React.MouseEvent {
  return {
    clientX: 0,
    clientY: 0,
    shiftKey: false,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...overrides
  } as unknown as React.MouseEvent;
}

describe('useZoomPan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should use defaults when opts not provided', () => {
    const { result } = renderHook(() => useZoomPan());

    expect(result.current.zoom).toBe(1);
    expect(result.current.pan).toEqual({ x: 0, y: 0 });
    expect(result.current.isPanning).toBe(false);
    expect(result.current.containerCursor).toBe('default');

    const sx = result.current.getImageSx();
    expect(sx.transform).toBe('translate(0px, 0px) scale(1)');
    expect(sx.transformOrigin).toBe('center center');
    expect(sx.transition).toBe('transform 120ms ease-out');
  });

  test('reset should set zoom=1, pan=0, isPanning=false', () => {
    const { result } = renderHook(() => useZoomPan({ minZoom: 0.5, maxZoom: 4, step: 1, enabled: true }));

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.zoom).toBeGreaterThan(1);

    act(() => {
      result.current.onMouseDown(mouseEvent({ clientX: 10, clientY: 10 }));
    });

    expect(result.current.isPanning).toBe(true); // sanity check

    act(() => {
      result.current.onMouseMove(mouseEvent({ clientX: 20, clientY: 30 }));
    });

    expect(result.current.pan).toEqual({ x: 10, y: 20 });

    act(() => {
      result.current.reset();
    });

    expect(result.current.zoom).toBe(1);
    expect(result.current.pan).toEqual({ x: 0, y: 0 });
    expect(result.current.isPanning).toBe(false);
  });

  test('zoomIn should increment by step and clamp to maxZoom', () => {
    const { result } = renderHook(() => useZoomPan({ minZoom: 1, maxZoom: 2, step: 0.7, enabled: true }));

    act(() => {
      result.current.zoomIn();
    });
    expect(result.current.zoom).toBe(1.7);

    act(() => {
      result.current.zoomIn();
    });
    expect(result.current.zoom).toBe(2);
  });

  test('zoomOut should decrement by step and clamp to minZoom', () => {
    const { result } = renderHook(() => useZoomPan({ minZoom: 0.5, maxZoom: 3, step: 0.6, enabled: true }));

    act(() => {
      result.current.zoomIn();
      result.current.zoomIn();
    });
    expect(result.current.zoom).toBe(2.2);

    act(() => {
      result.current.zoomOut();
      result.current.zoomOut();
      result.current.zoomOut();
    });
    expect(result.current.zoom).toBe(0.5);
  });

  test('zoomIn/zoomOut should do nothing when enabled=false', () => {
    const { result } = renderHook(() => useZoomPan({ minZoom: 1, maxZoom: 4, step: 1, enabled: false }));

    act(() => {
      result.current.zoomIn();
      result.current.zoomOut();
    });

    expect(result.current.zoom).toBe(1);
    expect(result.current.pan).toEqual({ x: 0, y: 0 });
  });

  test('onImageClick should zoomIn on normal click, zoomOut on shift+click, always stop propagation', () => {
    const { result } = renderHook(() => useZoomPan({ minZoom: 1, maxZoom: 4, step: 1, enabled: true }));

    const ev1 = mouseEvent({ shiftKey: false });
    act(() => result.current.onImageClick(ev1));
    expect(ev1.stopPropagation).toHaveBeenCalled();
    expect(result.current.zoom).toBe(2);

    const ev2 = mouseEvent({ shiftKey: true });
    act(() => result.current.onImageClick(ev2));
    expect(ev2.stopPropagation).toHaveBeenCalled();
    expect(result.current.zoom).toBe(1);
  });

  test('onImageClick should do nothing when enabled=false (but should not throw)', () => {
    const { result } = renderHook(() => useZoomPan({ enabled: false, step: 1 }));

    const ev = mouseEvent({ shiftKey: false });
    act(() => result.current.onImageClick(ev));

    expect(result.current.zoom).toBe(1);
  });

  test('onMouseDown: should do nothing when zoom<=1; does not set isPanning', () => {
    const { result } = renderHook(() => useZoomPan({ enabled: true, step: 1 }));

    const ev = mouseEvent({ clientX: 10, clientY: 10 });
    act(() => result.current.onMouseDown(ev));

    expect(result.current.isPanning).toBe(false);
    expect(ev.preventDefault).not.toHaveBeenCalled();
    expect(ev.stopPropagation).not.toHaveBeenCalled();
  });

  test('onMouseDown: when zoom>1 should set isPanning and store start; call preventDefault+stopPropagation', () => {
    const { result } = renderHook(() => useZoomPan({ enabled: true, step: 1 }));

    act(() => result.current.zoomIn());
    expect(result.current.zoom).toBe(2);

    const ev = mouseEvent({ clientX: 10, clientY: 20 });
    act(() => result.current.onMouseDown(ev));

    expect(ev.preventDefault).toHaveBeenCalled();
    expect(ev.stopPropagation).toHaveBeenCalled();
    expect(result.current.isPanning).toBe(true);
    expect(result.current.containerCursor).toBe('grabbing');
  });

  test('onMouseMove: should only pan when isPanning and panStart exists; call preventDefault', () => {
    const { result } = renderHook(() => useZoomPan({ enabled: true, step: 1 }));

    act(() => result.current.zoomIn());
    act(() => result.current.onMouseDown(mouseEvent({ clientX: 5, clientY: 5 })));

    const moveEv = mouseEvent({ clientX: 25, clientY: 45 });
    act(() => result.current.onMouseMove(moveEv));

    expect(result.current.pan).toEqual({ x: 20, y: 40 });
    expect(moveEv.preventDefault).toHaveBeenCalled();
  });

  test('onMouseMove: should do nothing if not panning', () => {
    const { result } = renderHook(() => useZoomPan({ enabled: true }));

    const ev = mouseEvent({ clientX: 10, clientY: 10 });
    act(() => result.current.onMouseMove(ev));

    expect(result.current.pan).toEqual({ x: 0, y: 0 });
    expect(ev.preventDefault).not.toHaveBeenCalled();
  });

  test('endPan should stop panning and clear panStart', () => {
    const { result } = renderHook(() => useZoomPan({ enabled: true, step: 1 }));

    act(() => result.current.zoomIn());
    act(() => result.current.onMouseDown(mouseEvent({ clientX: 1, clientY: 1 })));
    expect(result.current.isPanning).toBe(true);

    act(() => result.current.endPan());
    expect(result.current.isPanning).toBe(false);
    expect(result.current.containerCursor).toBe('grab');
  });

  test('getImageSx should merge base styles and changes transition depending on isPanning', () => {
    const { result } = renderHook(() => useZoomPan({ enabled: true, step: 1 }));

    const sx1 = result.current.getImageSx({ opacity: 0.5 });
    expect(sx1.opacity).toBe(0.5);
    expect(sx1.transition).toBe('transform 120ms ease-out');

    act(() => result.current.zoomIn());
    act(() => result.current.onMouseDown(mouseEvent({ clientX: 0, clientY: 0 })));

    const sx2 = result.current.getImageSx();
    expect(sx2.transition).toBe('none');
  });

  test('zoomOut should reset pan when next zoom equals 1', () => {
    const { result } = renderHook(() => useZoomPan({ enabled: true, minZoom: 0.5, maxZoom: 3, step: 0.5 }));

    act(() => result.current.zoomIn());

    act(() => result.current.onMouseDown(mouseEvent({ clientX: 0, clientY: 0 })));
    act(() => result.current.onMouseMove(mouseEvent({ clientX: 10, clientY: 10 })));
    expect(result.current.pan).toEqual({ x: 10, y: 10 });

    act(() => result.current.zoomOut());
    expect(result.current.zoom).toBe(1);
    expect(result.current.pan).toEqual({ x: 0, y: 0 });
  });

  test('containerCursor should be default when zoom<=1, grab/grabbing when zoom>1', () => {
    const { result } = renderHook(() => useZoomPan({ enabled: true, step: 1 }));

    expect(result.current.containerCursor).toBe('default');

    act(() => result.current.zoomIn());
    expect(result.current.containerCursor).toBe('grab');

    act(() => result.current.onMouseDown(mouseEvent({ clientX: 0, clientY: 0 })));
    expect(result.current.containerCursor).toBe('grabbing');

    act(() => result.current.endPan());
    expect(result.current.containerCursor).toBe('grab');

    act(() => result.current.zoomOut());
    expect(result.current.containerCursor).toBe('default');
  });
});
