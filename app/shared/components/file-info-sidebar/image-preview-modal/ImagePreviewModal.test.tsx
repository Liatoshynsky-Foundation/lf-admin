import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ImagePreviewModal } from './ImagePreviewModal';

jest.mock('./ImagePreviewModal.styles', () => ({
  styles: {
    root: () => ({}),
    viewer: () => ({}),
    closeButton: () => ({}),
    img: () => ({})
  }
}));

jest.mock('~/public/icons/close.svg', () => {
  return function CloseIconMock() {
    return React.createElement('svg', { 'data-testid': 'close-icon' });
  };
});

type ZoomPanReturn = {
  reset: jest.Mock;
  zoomIn: jest.Mock;
  zoomOut: jest.Mock;
  onImageClick: jest.Mock;
  onMouseDown: jest.Mock;
  onMouseMove: jest.Mock;
  endPan: jest.Mock;
  getImageSx: jest.Mock<React.CSSProperties, []>;
  containerCursor: string;
};

const zoomPanMock: ZoomPanReturn = {
  reset: jest.fn(),
  zoomIn: jest.fn(),
  zoomOut: jest.fn(),
  onImageClick: jest.fn(),
  onMouseDown: jest.fn(),
  onMouseMove: jest.fn(),
  endPan: jest.fn(),
  getImageSx: jest.fn(() => ({})),
  containerCursor: 'default'
};

jest.mock('~/shared/hooks/use-zoom-pan/useZoomPan', () => ({
  useZoomPan: () => zoomPanMock
}));

function renderModal(props?: Partial<React.ComponentProps<typeof ImagePreviewModal>>) {
  const defaultProps: React.ComponentProps<typeof ImagePreviewModal> = {
    open: true,
    src: '/x.png',
    alt: 'Preview image',
    onClose: jest.fn(),
    padding: 40
  };

  const merged = { ...defaultProps, ...props };
  const utils = render(<ImagePreviewModal {...merged} />);
  return { ...utils, props: merged };
}

describe('ImagePreviewModal', () => {
  let addSpy: jest.SpyInstance;
  let removeSpy: jest.SpyInstance;

  let wheelHandler: ((e: WheelEvent) => void) | null = null;
  let wheelOptions: AddEventListenerOptions | boolean | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    wheelHandler = null;
    wheelOptions = undefined;

    addSpy = jest.spyOn(globalThis, 'addEventListener').mockImplementation((type: any, listener: any, options: any) => {
      if (type === 'wheel') {
        wheelHandler = listener as (e: WheelEvent) => void;
        wheelOptions = options;
      }
    });

    removeSpy = jest.spyOn(globalThis, 'removeEventListener').mockImplementation(() => {});
  });

  afterEach(() => {
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  test('should render image when open', () => {
    renderModal({ open: true });
    expect(screen.getByRole('img', { name: 'Preview image' })).toBeInTheDocument();
  });

  test('should not render image when closed', () => {
    renderModal({ open: false });
    expect(screen.queryByRole('img', { name: 'Preview image' })).not.toBeInTheDocument();
  });

  test('should call reset on open', () => {
    const { rerender } = render(
      <ImagePreviewModal open={false} src="/x.png" alt="Preview image" onClose={jest.fn()} />
    );

    expect(zoomPanMock.reset).toHaveBeenCalledTimes(0);

    rerender(<ImagePreviewModal open={true} src="/x.png" alt="Preview image" onClose={jest.fn()} />);
    expect(zoomPanMock.reset).toHaveBeenCalledTimes(1);
  });

  test('should register window wheel listener when open', () => {
    renderModal({ open: true });

    expect(addSpy).toHaveBeenCalled();
    expect(wheelHandler).toBeTruthy();

    expect(wheelOptions).toEqual(expect.objectContaining({ passive: false }));
  });

  test('should not register wheel listener when closed', () => {
    renderModal({ open: false });

    expect(wheelHandler).toBeNull();
    expect(addSpy).not.toHaveBeenCalledWith('wheel', expect.any(Function), expect.anything());
  });

  test('should remove wheel listener on close (open true -> false)', () => {
    const { rerender } = renderModal({ open: true });

    const registered = wheelHandler;
    expect(registered).toBeTruthy();

    rerender(<ImagePreviewModal open={false} src="/x.png" alt="Preview image" onClose={jest.fn()} />);

    expect(removeSpy).toHaveBeenCalledWith('wheel', registered);
  });

  test('wheel handler should prevent default and zooms in/out', () => {
    renderModal({ open: true });

    expect(wheelHandler).toBeTruthy();

    const preventDefault = jest.fn();

    wheelHandler!({
      deltaY: -10,
      preventDefault
    } as unknown as WheelEvent);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(zoomPanMock.zoomIn).toHaveBeenCalledTimes(1);
    expect(zoomPanMock.zoomOut).toHaveBeenCalledTimes(0);

    wheelHandler!({
      deltaY: 10,
      preventDefault
    } as unknown as WheelEvent);

    expect(zoomPanMock.zoomOut).toHaveBeenCalledTimes(1);
  });

  test('should click outside imageWrap closes modal (viewer click)', () => {
    const onClose = jest.fn();
    renderModal({ onClose, open: true });

    const img = screen.getByRole('img', { name: 'Preview image' });

    const imageWrap = img.parentElement;
    expect(imageWrap).toBeTruthy();

    const viewer = imageWrap!.parentElement;
    expect(viewer).toBeTruthy();

    fireEvent.click(viewer as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('should click inside imageWrap does not close', () => {
    const onClose = jest.fn();
    renderModal({ onClose, open: true });

    const img = screen.getByRole('img', { name: 'Preview image' });
    fireEvent.click(img);

    expect(onClose).toHaveBeenCalledTimes(0);
  });

  test('should close button click closes modal', () => {
    const onClose = jest.fn();
    renderModal({ onClose, open: true });

    const btn = screen.getByRole('button', { name: /close preview/i });
    fireEvent.click(btn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
