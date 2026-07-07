import { act, fireEvent, render, screen } from '@testing-library/react';

import { SelectedMedia } from '../../MediaModal.types';
import { CropView } from './CropView';

let resizeCallback: ResizeObserverCallback | null = null;

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
});

jest.mock('react-image-crop', () => ({
  __esModule: true,
  default: ({ children, onChange, onComplete, crop }: any) => (
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
  )
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
    const uploadSelected: any = {
      kind: 'upload',
      id: '2',
      file: file,
      src: '',
      locale: 'uk'
    };

    const { unmount, rerender } = render(
      <CropView selected={uploadSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(file);

    rerender(
      <CropView
        selected={{ ...uploadSelected, file: null } as const}
        crop={null}
        resetSeq={0}
        onBaseline={jest.fn()}
        onChange={jest.fn()}
      />
    );
    unmount();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('should set data-reset-seq attribute', () => {
    render(
      <CropView selected={defaultSelected} crop={null} resetSeq={5} onBaseline={jest.fn()} onChange={jest.fn()} />
    );
    expect(screen.getByTestId('CropView')).toHaveAttribute('data-reset-seq', '5');
  });

  it('should scale down the internal crop state proportionally when container shrinks', () => {
    render(
      <CropView selected={defaultSelected} crop={null} resetSeq={0} onBaseline={jest.fn()} onChange={jest.fn()} />
    );

    const imgInitialSozes = { width: 400, height: 300, naturalWidth: 800, naturalHeight: 600 };
    const cropPosition = { x: 0, y: 0 };
    const newContainerSize = { width: 200, height: 150 };
    const img = screen.getByAltText('');
    const container = screen.getByTestId('mock-react-crop').parentElement;

    Object.defineProperty(img, 'width', { value: imgInitialSozes.width, configurable: true });
    Object.defineProperty(img, 'height', { value: imgInitialSozes.height, configurable: true });
    Object.defineProperty(img, 'naturalWidth', { value: imgInitialSozes.naturalWidth, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: imgInitialSozes.naturalHeight, configurable: true });

    Object.defineProperty(container, 'clientWidth', { value: imgInitialSozes.width, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: imgInitialSozes.height, configurable: true });

    act(() => {
      fireEvent.load(img);
    });

    const mockReactCropBefore = screen.getByTestId('mock-react-crop');
    const cropBefore = JSON.parse(mockReactCropBefore.dataset.currentCrop || '{}');
    expect(cropBefore).toEqual({
      unit: 'px',
      x: cropPosition.x,
      y: cropPosition.y,
      width: imgInitialSozes.width,
      height: imgInitialSozes.height
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
    const cropAfter = JSON.parse(mockReactCropAfter.dataset.currentCrop || '{}');

    expect(cropAfter).toEqual({
      unit: 'px',
      x: cropPosition.x,
      y: cropPosition.y,
      width: newContainerSize.width,
      height: newContainerSize.height
    });
  });
});
