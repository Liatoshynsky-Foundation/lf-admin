import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { WarCarousel } from './WarCarousel';
import { BLOCK_IDS } from '~/constants/pageBlocks';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

let originalCrypto: Crypto;

beforeAll(() => {
  originalCrypto = global.crypto;

  Object.defineProperty(global, 'crypto', {
    configurable: true,
    value: {
      ...originalCrypto,
      randomUUID: jest.fn().mockReturnValue('mocked-uuid-carousel')
    }
  });
});

afterAll(() => {
  Object.defineProperty(global, 'crypto', {
    configurable: true,
    value: originalCrypto
  });
});

jest.mock('~/shared/hooks/use-page-block/usePageBlock');
jest.mock('~/store');

jest.mock('~/shared/components/edit-block-skeleton/EditBlockSkeleton', () => ({
  EditBlockSkeleton: () => <div data-testid="edit-block-skeleton" />
}));

jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ title, children, hidden, onToggleVisibility }: any) => (
    <div data-testid="collapsible-block" data-hidden={hidden}>
      <span>{title}</span>
      <button type="button" data-testid="toggle-visibility-btn" onClick={onToggleVisibility}>
        Toggle Visibility
      </button>
      {children}
    </div>
  )
}));

jest.mock('../CarouselImageCard/CarouselImageCard', () => ({
  CarouselImageCard: ({ image }: any) => (
    <div data-testid={`carousel-card-${image.id}`}>
      {image.src}
    </div>
  )
}));

jest.mock('~/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: ({ items, addBtnLabel, onCreate, onChange, onDelete, renderItem }: any) => (
    <div data-testid="configurable-list" data-count={items.length}>
      <button type="button" data-testid="create-image-btn" onClick={() => onCreate()}>
        {addBtnLabel}
      </button>
      {items.map((item: any, index: number) => (
        <div key={item.id || index} data-testid={`image-row-${index}`}>
          {renderItem({ item, index })}
          <button type="button" data-testid={`update-image-btn-${index}`} onClick={() => onChange({ ...item, src: 'https://images.com/updated.jpg' })}>
            Update Image
          </button>
          <button type="button" data-testid={`delete-image-btn-${index}`} onClick={() => onDelete(item.id)}>
            Delete Image
          </button>
        </div>
      ))}
    </div>
  )
}));

describe('WarCarousel', () => {
  const mockToggleVisibility = jest.fn();
  const mockSetField = jest.fn();
  const expectedBlockId = BLOCK_IDS.WAR_CAROUSEL;

  const mockBlockData = {
    hidden: false,
    images: [
      { id: 'img-1', src: '/images/1.jpg', alt: { uk: 'Фото 1', en: 'Photo 1' } }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders EditBlockSkeleton when block is not loaded', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: null });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk' }));

    render(<WarCarousel />);
    expect(screen.getByTestId('edit-block-skeleton')).toBeInTheDocument();
  });

  it('renders form correctly when block data is available', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', toggleBlockVisibility: mockToggleVisibility }));

    render(<WarCarousel />);
    expect(screen.getByTestId('carousel-card-img-1')).toHaveTextContent('/images/1.jpg');
  });

  it('applies default fallbacks for missing images', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: { hidden: true, images: [{ id: 2 }] } });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'en', toggleBlockVisibility: mockToggleVisibility }));

    render(<WarCarousel />);
    expect(screen.getByTestId('carousel-card-2')).toBeInTheDocument();
  });

  it('toggles block visibility correctly', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', toggleBlockVisibility: mockToggleVisibility }));

    render(<WarCarousel />);
    fireEvent.click(screen.getByTestId('toggle-visibility-btn'));
    expect(mockToggleVisibility).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId);
  });

  it('adds a new image when ConfigurableList triggers onCreate', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<WarCarousel />);
    fireEvent.click(screen.getByTestId('create-image-btn'));

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'images', [
      { id: 'img-1', src: '/images/1.jpg', alt: { uk: 'Фото 1', en: 'Photo 1' }, caption: { uk: '', en: '' } },
      { id: 'mocked-uuid-carousel', src: '', alt: { uk: '', en: '' }, caption: { uk: '', en: '' } }
    ]);
  });

  it('updates a single image', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<WarCarousel />);
    fireEvent.click(screen.getByTestId('update-image-btn-0'));

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'images', [
      { id: 'img-1', src: 'https://images.com/updated.jpg', alt: { uk: 'Фото 1', en: 'Photo 1' }, caption: { uk: '', en: '' } }
    ]);
  });

  it('removes an image', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<WarCarousel />);
    fireEvent.click(screen.getByTestId('delete-image-btn-0'));

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'images', []);
  });
});