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

jest.mock('~/shared/components/design-system/button/Button.styles', () => ({
  colors: { blue: { 900: '#000000' } }
}));

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

type NonPassiveWheelArgs = {
  enabled: boolean;
  onWheel: (e: WheelEvent) => void;
};

let lastWheelArgs: NonPassiveWheelArgs | null = null;

jest.mock('./useNonPassiveWheel', () => ({
  useNonPassiveWheel: (_ref: React.RefObject<HTMLElement | null>, opts: NonPassiveWheelArgs) => {
    lastWheelArgs = opts;
  }
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
  beforeEach(() => {
    jest.clearAllMocks();
    lastWheelArgs = null;
  });

  test('renders image when open', () => {
    renderModal({ open: true });
    expect(screen.getByRole('img', { name: 'Preview image' })).toBeInTheDocument();
  });

  test('does not render image when closed', () => {
    renderModal({ open: false });
    expect(screen.queryByRole('img', { name: 'Preview image' })).not.toBeInTheDocument();
  });

  test('calls reset on open', () => {
    const { rerender } = render(
      <ImagePreviewModal open={false} src="/x.png" alt="Preview image" onClose={jest.fn()} />
    );

    expect(zoomPanMock.reset).toHaveBeenCalledTimes(0);

    rerender(<ImagePreviewModal open={true} src="/x.png" alt="Preview image" onClose={jest.fn()} />);
    expect(zoomPanMock.reset).toHaveBeenCalledTimes(1);
  });

  test('useNonPassiveWheel enabled follows open', () => {
    renderModal({ open: true });
    expect(lastWheelArgs?.enabled).toBe(true);

    renderModal({ open: false });
    expect(lastWheelArgs?.enabled).toBe(false);
  });

  test('click outside imageWrap closes modal (viewer click)', () => {
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

  test('click inside imageWrap does not close (image click bubbles but guarded)', () => {
    const onClose = jest.fn();
    renderModal({ onClose, open: true });

    const img = screen.getByRole('img', { name: 'Preview image' });
    fireEvent.click(img);

    expect(onClose).toHaveBeenCalledTimes(0);
  });

  test('close button click stops propagation and closes', () => {
    const onClose = jest.fn();
    renderModal({ onClose, open: true });

    const btn = screen.getByRole('button', { name: /close preview/i });
    fireEvent.click(btn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('wheel handler prevents default and zooms in/out', () => {
    renderModal({ open: true });

    expect(lastWheelArgs).not.toBeNull();

    const evIn = new WheelEvent('wheel', { deltaY: -10 });
    const preventSpyIn = jest.spyOn(evIn, 'preventDefault');

    lastWheelArgs!.onWheel(evIn);

    expect(preventSpyIn).toHaveBeenCalledTimes(1);
    expect(zoomPanMock.zoomIn).toHaveBeenCalledTimes(1);
    expect(zoomPanMock.zoomOut).toHaveBeenCalledTimes(0);

    const evOut = new WheelEvent('wheel', { deltaY: 10 });
    const preventSpyOut = jest.spyOn(evOut, 'preventDefault');

    lastWheelArgs!.onWheel(evOut);

    expect(preventSpyOut).toHaveBeenCalledTimes(1);
    expect(zoomPanMock.zoomOut).toHaveBeenCalledTimes(1);
  });
});
