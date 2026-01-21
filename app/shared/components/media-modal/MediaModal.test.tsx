import { render, screen } from '@testing-library/react';
import React from 'react';

import { MediaModalFlow } from './flow/MediaModalFlow';
import { MediaModal } from './MediaModal';

const mockGalleryFilters = {
  search: '',
  favorites: '',
  usage: ''
};

const mockUsedFilters = {
  search: '',
  language: ''
};

jest.mock('./flow/MediaModalFlow', () => ({
  __esModule: true,
  MediaModalFlow: jest.fn(() => null)
}));

jest.mock('./views/gallery-view/GalleryView', () => ({
  __esModule: true,
  GalleryView: () => <div data-testid="GalleryView" />
}));

jest.mock('./views/upload-view/UploadView', () => ({
  __esModule: true,
  UploadView: () => <div data-testid="UploadView" />
}));

jest.mock('./views/used-view/UsedView', () => ({
  __esModule: true,
  UsedView: () => <div data-testid="UsedView" />
}));

jest.mock('./views/crop-view/CropView', () => ({
  __esModule: true,
  CropView: () => <div data-testid="CropView" />
}));

const getFlowProps = () => {
  const mock = MediaModalFlow as unknown as jest.Mock;
  expect(mock).toHaveBeenCalledTimes(1);
  return mock.mock.calls[0][0] as React.ComponentProps<typeof MediaModalFlow>;
};

describe('MediaModal', () => {
  beforeEach(() => {
    (MediaModalFlow as unknown as jest.Mock).mockClear();
  });

  it('should provide default renderers to MediaModalFlow', () => {
    render(<MediaModal open onClose={jest.fn()} onApply={jest.fn()} initial={{ tab: 'GALLERY' }} />);

    const { renderers } = getFlowProps();

    render(
      <>
        {renderers.gallery({
          selected: null,
          onPick: jest.fn(),
          filters: mockGalleryFilters,
          onFiltersChange: jest.fn()
        })}
        {renderers.upload({ selected: null, onPick: jest.fn() })}
        {renderers.used({ selected: null, onPick: jest.fn(), filters: mockUsedFilters, onFiltersChange: jest.fn() })}
        {renderers.crop({
          selected: { kind: 'gallery', id: '1', fileName: 'a.png', src: '/x', locale: 'uk' },
          crop: null,
          onBaseline: jest.fn(),
          resetSeq: 0,
          onChange: jest.fn()
        })}
      </>
    );

    expect(screen.getByTestId('GalleryView')).toBeInTheDocument();
    expect(screen.getByTestId('UploadView')).toBeInTheDocument();
    expect(screen.getByTestId('UsedView')).toBeInTheDocument();
    expect(screen.getByTestId('CropView')).toBeInTheDocument();
  });

  it('should merge renderer overrides (override wins)', () => {
    render(
      <MediaModal
        open
        onClose={jest.fn()}
        onApply={jest.fn()}
        renderers={{
          gallery: () => <div data-testid="GalleryOverride" />
        }}
      />
    );

    const { renderers } = getFlowProps();

    render(
      <>
        {renderers.gallery({
          selected: null,
          onPick: jest.fn(),
          filters: mockGalleryFilters,
          onFiltersChange: jest.fn()
        })}
        {renderers.used({ selected: null, onPick: jest.fn(), filters: mockUsedFilters, onFiltersChange: jest.fn() })}
      </>
    );

    expect(screen.getByTestId('GalleryOverride')).toBeInTheDocument();
    expect(screen.queryByTestId('GalleryView')).not.toBeInTheDocument();
    expect(screen.getByTestId('UsedView')).toBeInTheDocument();
  });

  it('should pass open prop to MediaModalFlow', () => {
    render(<MediaModal open={true} onClose={jest.fn()} onApply={jest.fn()} />);

    const { open } = getFlowProps();
    expect(open).toBe(true);
  });

  it('should pass onClose prop to MediaModalFlow', () => {
    const mockOnClose = jest.fn();
    render(<MediaModal open onClose={mockOnClose} onApply={jest.fn()} />);

    const { onClose } = getFlowProps();
    expect(onClose).toBe(mockOnClose);
  });

  it('should pass onApply prop to MediaModalFlow', () => {
    const mockOnApply = jest.fn();
    render(<MediaModal open onClose={jest.fn()} onApply={mockOnApply} />);

    const { onApply } = getFlowProps();
    expect(onApply).toBe(mockOnApply);
  });

  it('should pass initial state to MediaModalFlow', () => {
    const initialState = { tab: 'UPLOAD' as const };
    render(<MediaModal open onClose={jest.fn()} onApply={jest.fn()} initial={initialState} />);

    const { initial } = getFlowProps();
    expect(initial).toEqual(initialState);
  });

  it('should render with all default renderers when no overrides provided', () => {
    render(<MediaModal open onClose={jest.fn()} onApply={jest.fn()} />);

    const { renderers } = getFlowProps();

    expect(renderers.gallery).toBeDefined();
    expect(renderers.upload).toBeDefined();
    expect(renderers.used).toBeDefined();
    expect(renderers.crop).toBeDefined();
  });

  it('should handle closed state', () => {
    render(<MediaModal open={false} onClose={jest.fn()} onApply={jest.fn()} />);

    const { open } = getFlowProps();
    expect(open).toBe(false);
  });

  it('should allow partial renderer overrides', () => {
    const customUpload = () => <div data-testid="CustomUpload" />;

    render(<MediaModal open onClose={jest.fn()} onApply={jest.fn()} renderers={{ upload: customUpload }} />);

    const { renderers } = getFlowProps();

    expect(renderers.upload).toBe(customUpload);
    expect(renderers.gallery).toBeDefined();
    expect(renderers.used).toBeDefined();
    expect(renderers.crop).toBeDefined();
  });

  it('should render multiple views from renderers', () => {
    render(<MediaModal open onClose={jest.fn()} onApply={jest.fn()} />);

    const { renderers } = getFlowProps();

    const views = (
      <>
        {renderers.gallery({
          selected: null,
          onPick: jest.fn(),
          filters: mockGalleryFilters,
          onFiltersChange: jest.fn()
        })}
        {renderers.upload({ selected: null, onPick: jest.fn() })}
        {renderers.used({ selected: null, onPick: jest.fn(), filters: mockUsedFilters, onFiltersChange: jest.fn() })}
      </>
    );

    const { container } = render(views);
    expect(container).toBeInTheDocument();
  });
});
