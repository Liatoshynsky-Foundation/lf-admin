import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CropView } from './CropView';

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: ({ label, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {label}
    </button>
  )
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe('CropView', () => {
  const mockOnChange = jest.fn();
  const mockOnBaseline = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnBaseline.mockClear();
  });

  it('should render crop view component', () => {
    render(
      <CropView
        selected={{ kind: 'gallery', id: '1', fileName: 'test.jpg', src: '/test.jpg', locale: 'uk' }}
        crop={null}
        onChange={mockOnChange}
        onBaseline={mockOnBaseline}
        resetSeq={0}
      />
    );

    expect(screen.getByTestId('CropView')).toBeInTheDocument();
  });

  it('should render placeholder text', () => {
    render(
      <CropView
        selected={{ kind: 'gallery', id: '1', fileName: 'test.jpg', src: '/test.jpg', locale: 'uk' }}
        crop={null}
        onChange={mockOnChange}
        onBaseline={mockOnBaseline}
        resetSeq={0}
      />
    );

    expect(screen.getByText('Crop placeholder')).toBeInTheDocument();
  });

  it('should render resize button', () => {
    render(
      <CropView
        selected={{ kind: 'gallery', id: '1', fileName: 'test.jpg', src: '/test.jpg', locale: 'uk' }}
        crop={null}
        onChange={mockOnChange}
        onBaseline={mockOnBaseline}
        resetSeq={0}
      />
    );

    expect(screen.getByText('Mock resize')).toBeInTheDocument();
  });

  it('should call onChange when resize button clicked', async () => {
    const user = userEvent.setup();
    render(
      <CropView
        selected={{ kind: 'gallery', id: '1', fileName: 'test.jpg', src: '/test.jpg', locale: 'uk' }}
        crop={null}
        onChange={mockOnChange}
        onBaseline={mockOnBaseline}
        resetSeq={0}
      />
    );

    const button = screen.getByTestId('CropView-resize');
    await user.click(button);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        rect: expect.objectContaining({
          x: 24,
          y: 18,
          width: 160,
          height: 220
        })
      })
    );
  });

  it('should call onBaseline on mount', () => {
    render(
      <CropView
        selected={{ kind: 'gallery', id: '1', fileName: 'test.jpg', src: '/test.jpg', locale: 'uk' }}
        crop={null}
        onChange={mockOnChange}
        onBaseline={mockOnBaseline}
        resetSeq={0}
      />
    );

    expect(mockOnBaseline).toHaveBeenCalledWith(
      expect.objectContaining({
        rect: expect.objectContaining({
          x: 0,
          y: 0,
          width: 200,
          height: 200
        })
      })
    );
  });

  it('should render with resetSeq attribute', () => {
    render(
      <CropView
        selected={{ kind: 'gallery', id: '1', fileName: 'test.jpg', src: '/test.jpg', locale: 'uk' }}
        crop={null}
        onChange={mockOnChange}
        onBaseline={mockOnBaseline}
        resetSeq={5}
      />
    );

    const cropView = screen.getByTestId('CropView');
    expect(cropView).toHaveAttribute('data-reset-seq', '5');
  });
});
