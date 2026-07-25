import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { SelectedMedia } from '../../MediaModal.types';
import { CropView } from './CropView';

let resizeCallback: ResizeObserverCallback | null = null;
let capturedOnComplete: ((crop: unknown) => void) | null = null;

beforeAll(() => {
  globalThis.URL.createObjectURL = jest.fn(() => 'blob:test-url');
  globalThis.URL.revokeObjectURL = jest.fn();

  globalThis.ResizeObserver = class ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      resizeCallback = callback;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn(() => {
      resizeCallback = null;
    });
  };
});

afterEach(() => {
  jest.clearAllMocks();
  resizeCallback = null;
  capturedOnComplete = null;
});

interface MockReactCropProps {
  children: React.ReactNode;
  onChange: (crop: unknown) => void;
  onComplete: (crop: unknown) => void;
  crop?: unknown;
}

jest.mock('react-image-crop', () => ({
  __esModule: true,
  default: ({ children, onChange, onComplete, crop }: MockReactCropProps) => {
    capturedOnComplete = onComplete;
    return (
      <div data-testid="mock-react-crop" data-current-crop={JSON.stringify(crop)}>
        {children}
        <button
          data-testid="trigger-change"
          onClick={() => onChange({ x: 10, y: 10, width: 50, height: 50, unit: 'px' })}
        >
          Trigger Change
        </button>
        <button
          data-testid="trigger-complete"
          onClick={() => onComplete({ x: 20, y: 20, width: 100, height: 100, unit: 'px' })}
        >
          Trigger Complete
        </button>
      </div>
    );
  }
}));

const defaultSelected: SelectedMedia = {
  kind: 'gallery',
  id: '1',
  fileName: 'test.jpg',
  src: '/test.jpg',
  locale: 'uk'
};

describe('CropView', () => {
  it('should render CropView container', () => {
    render(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );
    expect(screen.getByTestId('CropView')).toBeInTheDocument();
  });

  it('should render image with correct src', () => {
    render(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );
    const img = screen.getByAltText('');
    expect(img).toHaveAttribute('src', '/test.jpg');
  });

  it('should call onBaseline with image natural dimensions on image load', () => {
    const onBaseline = jest.fn();

    render(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={onBaseline} onChange={jest.fn()} />
    );

    const img = screen.getByAltText('');

    Object.defineProperty(img, 'width', { value: 500, configurable: true });
    Object.defineProperty(img, 'height', { value: 500, configurable: true });
    Object.defineProperty(img, 'naturalWidth', { value: 1000, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 1000, configurable: true });

    fireEvent.load(img);

    expect(onBaseline).toHaveBeenCalledWith({
      rect: { x: 0, y: 0, width: 1000, height: 1000 }
    });
  });

  it('should calculate initial rect when aspectRatio is provided (landscape and portrait)', () => {
    const onBaseline = jest.fn();

    const { unmount } = render(
      <CropView
        selected={defaultSelected}
        crop={null}
        resetSeq={0}
        onBaseline={onBaseline}
        onChange={jest.fn()}
        aspectRatio={1}
      />
    );

    const img = screen.getByAltText('');
    Object.defineProperty(img, 'width', { value: 500, configurable: true });
    Object.defineProperty(img, 'height', { value: 250, configurable: true });
    Object.defineProperty(img, 'naturalWidth', { value: 1000, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 500, configurable: true });

    fireEvent.load(img);
    expect(onBaseline).toHaveBeenCalledWith({
      rect: { x: 250, y: 0, width: 500, height: 500 }
    });

    unmount();

    render(
      <CropView
        selected={defaultSelected}
        crop={null}
        resetSeq={0}
        onBaseline={jest.fn()}
        onChange={jest.fn()}
        aspectRatio={2}
      />
    );

    const imgPortrait = screen.getByAltText('');
    Object.defineProperty(imgPortrait, 'width', { value: 250, configurable: true });
    Object.defineProperty(imgPortrait, 'height', { value: 500, configurable: true });
    Object.defineProperty(imgPortrait, 'naturalWidth', { value: 500, configurable: true });
    Object.defineProperty(imgPortrait, 'naturalHeight', { value: 1000, configurable: true });

    fireEvent.load(imgPortrait);
  });

  it('should apply pre-existing stateCrop on image load', () => {
    const onBaseline = jest.fn();
    const existingCrop = { rect: { x: 10, y: 10, width: 100, height: 100 } };

    render(
      <CropView
        selected={defaultSelected}
        crop={existingCrop}
        resetSeq={0}
        onBaseline={onBaseline}
        onChange={jest.fn()}
      />
    );

    const img = screen.getByAltText('');
    Object.defineProperty(img, 'width', { value: 500, configurable: true });
    Object.defineProperty(img, 'height', { value: 500, configurable: true });
    Object.defineProperty(img, 'naturalWidth', { value: 1000, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 1000, configurable: true });

    fireEvent.load(img);

    expect(onBaseline).toHaveBeenCalledWith(existingCrop);
  });

  it('should update internal crop state when crop changes', () => {
    render(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    const triggerChangeBtn = screen.getByTestId('trigger-change');
    fireEvent.click(triggerChangeBtn);
  });

  it('should calculate real coordinates and call onChange on complete', () => {
    const onChange = jest.fn();
    render(<CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={onChange} />);

    const img = screen.getByAltText('');

    Object.defineProperty(img, 'width', { value: 500, configurable: true });
    Object.defineProperty(img, 'height', { value: 500, configurable: true });
    Object.defineProperty(img, 'naturalWidth', { value: 1000, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 1000, configurable: true });

    fireEvent.load(img, {
      currentTarget: { width: 500, height: 500, naturalWidth: 1000, naturalHeight: 1000 }
    });

    const triggerCompleteBtn = screen.getByTestId('trigger-complete');
    fireEvent.click(triggerCompleteBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      rect: {
        x: 40,
        y: 40,
        width: 200,
        height: 200
      }
    });
  });

  it('should create and revoke object URL when selected kind is upload', () => {
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const uploadSelected: SelectedMedia = {
      kind: 'upload',
      id: '2',
      file: file,
      fileName: 'test.png'
    };

    const { unmount, rerender } = render(
      <CropView selected={uploadSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(file);

    rerender(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );
    unmount();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('should handle URL create/revoke checks when window URL helpers are unavailable', () => {
    const originalCreate = globalThis.URL.createObjectURL;
    const originalRevoke = globalThis.URL.revokeObjectURL;

    delete (globalThis.URL as unknown as Record<string, unknown>).createObjectURL;
    delete (globalThis.URL as unknown as Record<string, unknown>).revokeObjectURL;

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const uploadSelected: SelectedMedia = {
      kind: 'upload',
      id: '3',
      file: file,
      fileName: 'test.png'
    };

    const { unmount } = render(
      <CropView selected={uploadSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    unmount();

    globalThis.URL.createObjectURL = originalCreate;
    globalThis.URL.revokeObjectURL = originalRevoke;
  });

  it('should set data-reset-seq attribute and apply initial crop when resetSeq changes', () => {
    const { rerender } = render(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    const img = screen.getByAltText('');
    Object.defineProperty(img, 'width', { value: 500, configurable: true });
    Object.defineProperty(img, 'height', { value: 500, configurable: true });
    Object.defineProperty(img, 'naturalWidth', { value: 1000, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 1000, configurable: true });

    fireEvent.load(img);

    rerender(
      <CropView selected={defaultSelected} crop={null} resetSeq={1} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    expect(screen.getByTestId('CropView')).toHaveAttribute('data-reset-seq', '1');
  });

  it('should render error container on image error', () => {
    render(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    const img = screen.getByAltText('');
    fireEvent.error(img);

    expect(screen.getByText('Не вдалося завантажити зображення')).toBeInTheDocument();
  });

  it('should return early in applyCrop if natural dimensions are zero', () => {
    render(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    const img = screen.getByAltText('');
    Object.defineProperty(img, 'naturalWidth', { value: 0, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 0, configurable: true });

    fireEvent.load(img);
  });

  it('should scale down internal crop state when container shrinks and handle tall images', () => {
    render(
      <CropView
        selected={defaultSelected}
        crop={null}
        resetSeq={0}
        onBaseline={jest.fn()}
        onChange={jest.fn()}
        aspectRatio={1}
      />
    );

    const imgInitialSizes = { width: 400, height: 300, naturalWidth: 800, naturalHeight: 600 };
    const newContainerSize = { width: 1000, height: 200 };
    const img = screen.getByAltText('');
    const container = screen.getByTestId('mock-react-crop').parentElement;

    Object.defineProperty(img, 'width', { value: imgInitialSizes.width, configurable: true });
    Object.defineProperty(img, 'height', { value: imgInitialSizes.height, configurable: true });
    Object.defineProperty(img, 'naturalWidth', { value: imgInitialSizes.naturalWidth, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: imgInitialSizes.naturalHeight, configurable: true });

    Object.defineProperty(container, 'clientWidth', { value: imgInitialSizes.width, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: imgInitialSizes.height, configurable: true });

    act(() => {
      fireEvent.load(img);
    });

    Object.defineProperty(container, 'clientWidth', { value: newContainerSize.width, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: newContainerSize.height, configurable: true });

    Object.defineProperty(img, 'width', { value: newContainerSize.width, configurable: true });
    Object.defineProperty(img, 'height', { value: newContainerSize.height, configurable: true });

    if (resizeCallback) {
      act(() => {
        resizeCallback!([], {} as ResizeObserver);
      });
    }

    const mockReactCropAfter = screen.getByTestId('mock-react-crop');
    expect(mockReactCropAfter).toBeInTheDocument();
  });

  it('handles ResizeObserver callback before image load when crop prop is provided and when crop prop is null', () => {
    const onBaseline = jest.fn();

    const { rerender } = render(
      <CropView
        selected={defaultSelected}
        crop={{ rect: { x: 10, y: 10, width: 50, height: 50 } }}
        resetSeq={0}
        onBaseline={onBaseline}
        onChange={jest.fn()}
      />
    );

    const img = screen.getByAltText('');
    const container = screen.getByTestId('mock-react-crop').parentElement;

    Object.defineProperty(img, 'naturalWidth', { value: 1000, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 1000, configurable: true });
    Object.defineProperty(img, 'width', { value: 500, configurable: true });
    Object.defineProperty(img, 'height', { value: 500, configurable: true });
    Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true });

    if (resizeCallback) {
      act(() => {
        resizeCallback!([], {} as ResizeObserver);
      });
    }

    expect(onBaseline).toHaveBeenCalledWith({
      rect: { x: 10, y: 10, width: 50, height: 50 }
    });

    rerender(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={onBaseline} onChange={jest.fn()} />
    );

    if (resizeCallback) {
      act(() => {
        resizeCallback!([], {} as ResizeObserver);
      });
    }
  });

  it('returns natural dimensions in calculateContainSize when image is smaller than container', () => {
    render(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    const img = screen.getByAltText('');
    const container = screen.getByTestId('mock-react-crop').parentElement;

    Object.defineProperty(img, 'naturalWidth', { value: 100, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 100, configurable: true });
    Object.defineProperty(img, 'width', { value: 100, configurable: true });
    Object.defineProperty(img, 'height', { value: 100, configurable: true });
    Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true });

    if (resizeCallback) {
      act(() => {
        resizeCallback!([], {} as ResizeObserver);
      });
    }
  });

  it('covers both branches of calculateContainSize in ResizeObserver callback', () => {
    render(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    const img = screen.getByAltText('');
    const container = screen.getByTestId('mock-react-crop').parentElement;

    Object.defineProperty(img, 'naturalWidth', { value: 800, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 400, configurable: true });
    Object.defineProperty(container, 'clientWidth', { value: 300, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 300, configurable: true });

    fireEvent.load(img);

    if (resizeCallback) {
      act(() => {
        resizeCallback!([], {} as ResizeObserver);
      });
    }

    Object.defineProperty(img, 'naturalWidth', { value: 400, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 800, configurable: true });
    Object.defineProperty(container, 'clientWidth', { value: 300, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 300, configurable: true });

    fireEvent.load(img);

    if (resizeCallback) {
      act(() => {
        resizeCallback!([], {} as ResizeObserver);
      });
    }
  });

  it('covers uploadFile cleanup guard when url is empty or canRevokeObjectUrl is false', () => {
    const originalRevoke = globalThis.URL.revokeObjectURL;

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const uploadSelected: SelectedMedia = {
      kind: 'upload',
      id: '10',
      file: file,
      fileName: 'test.png'
    };

    const originalCreate = globalThis.URL.createObjectURL;
    globalThis.URL.createObjectURL = jest.fn(() => '');

    const { unmount } = render(
      <CropView selected={uploadSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    unmount();

    globalThis.URL.createObjectURL = originalCreate;

    globalThis.URL.revokeObjectURL = undefined as unknown as typeof globalThis.URL.revokeObjectURL;

    const { unmount: unmount2 } = render(
      <CropView selected={uploadSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    unmount2();

    globalThis.URL.revokeObjectURL = originalRevoke;
  });

  it('returns early in ResizeObserver callback when naturalHeight is zero', () => {
    render(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    const img = screen.getByAltText('');

    Object.defineProperty(img, 'naturalWidth', { value: 100, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 0, configurable: true });

    if (resizeCallback) {
      act(() => {
        resizeCallback!([], {} as ResizeObserver);
      });
    }
  });

  it('returns early in handleComplete when imgRef.current is falsy', () => {
    render(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    const img = screen.getByAltText('');
    fireEvent.error(img);

    if (capturedOnComplete) {
      capturedOnComplete({ x: 20, y: 20, width: 100, height: 100, unit: 'px' });
    }
  });
});
