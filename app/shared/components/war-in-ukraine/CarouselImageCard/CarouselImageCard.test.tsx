import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { CarouselImageCard, CarouselImageData } from './CarouselImageCard';

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({ imageUrl, fileName, onChangeImage, initialCrop }: any) => (
    <div data-testid="image-preview-block" data-url={imageUrl} data-filename={fileName}>
      <button
        type="button"
        data-testid="mock-change-image-btn"
        onClick={() => onChangeImage('https://new-image.com/img.jpg', { rect: { x: 0, y: 0, width: 100, height: 100 } })}
      >
        Change Image
      </button>
      <button
        type="button"
        data-testid="mock-change-image-no-crop-btn"
        onClick={() => onChangeImage('https://no-crop.com/img.jpg')}
      >
        Change Image No Crop
      </button>
      <span data-testid="crop-status">{initialCrop ? 'cropped' : 'uncropped'}</span>
    </div>
  )
}));

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({ title, value, onChange, label }: any) => (
    <div data-testid={`textfield-${title}`}>
      <label>{title}</label>
      <input
        aria-label={title}
        placeholder={label}
        value={value || ''}
        onChange={(e) => onChange(e)}
      />
      <button
        type="button"
        data-testid={`direct-string-btn-${title}`}
        onClick={() => onChange('Пряме значення рядком')}
      >
        Pass String
      </button>
      <button
        type="button"
        data-testid={`empty-string-btn-${title}`}
        onClick={() => onChange({ target: { value: '' } })}
      >
        Pass Empty
      </button>
    </div>
  )
}));

describe('CarouselImageCard', () => {
  const mockImage: CarouselImageData = {
    id: 1,
    src: '/images/test.jpg',
    alt: { uk: 'Тестовий альт', en: 'Test alt' },
    caption: { uk: 'Тестовий підпис', en: 'Test caption' },
    crop: null
  };

  const mockOnChangeImage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders image preview and text fields with correct values for Ukrainian locale', () => {
    render(<CarouselImageCard image={mockImage} currentLocale="uk" onChangeImage={mockOnChangeImage} />);

    expect(screen.getByTestId('image-preview-block')).toBeInTheDocument();
    expect(screen.getByTestId('image-preview-block')).toHaveAttribute('data-url', '/images/test.jpg');
    expect(screen.getByTestId('image-preview-block')).toHaveAttribute('data-filename', 'Тестовий альт');

    const altInput = screen.getByLabelText('Альтернативний текст') as HTMLInputElement;
    const captionInput = screen.getByLabelText('Підпис під фото') as HTMLInputElement;

    expect(altInput.value).toBe('Тестовий альт');
    expect(captionInput.value).toBe('Тестовий підпис');
  });

  it('renders fields with correct values for English locale', () => {
    render(<CarouselImageCard image={mockImage} currentLocale="en" onChangeImage={mockOnChangeImage} />);

    const altInput = screen.getByLabelText('Альтернативний текст') as HTMLInputElement;
    const captionInput = screen.getByLabelText('Підпис під фото') as HTMLInputElement;

    expect(altInput.value).toBe('Test alt');
    expect(captionInput.value).toBe('Test caption');
    expect(screen.getByTestId('image-preview-block')).toHaveAttribute('data-filename', 'Test alt');
  });

  it('renders with fallback image src and filename when image data is missing', () => {
    const bareImage: CarouselImageData = { id: 9, src: '', alt: {} as any };
    render(<CarouselImageCard image={bareImage} currentLocale="uk" onChangeImage={mockOnChangeImage} />);

    expect(screen.getByTestId('image-preview-block')).toHaveAttribute('data-url', '/images/light-logo.svg');
    expect(screen.getByTestId('image-preview-block')).toHaveAttribute('data-filename', 'image');
  });

  it('calls onChangeImage with updated alt text for current locale (event branch)', () => {
    render(<CarouselImageCard image={mockImage} currentLocale="uk" onChangeImage={mockOnChangeImage} />);

    const altInput = screen.getByLabelText('Альтернативний текст');
    fireEvent.change(altInput, { target: { value: 'Новий український альт' } });

    expect(mockOnChangeImage).toHaveBeenCalledTimes(1);
    expect(mockOnChangeImage).toHaveBeenCalledWith({
      ...mockImage,
      alt: {
        uk: 'Новий український альт',
        en: 'Test alt'
      }
    });
  });

  it('calls onChangeImage with updated caption for current locale (event branch)', () => {
    render(<CarouselImageCard image={mockImage} currentLocale="en" onChangeImage={mockOnChangeImage} />);

    const captionInput = screen.getByLabelText('Підпис під фото');
    fireEvent.change(captionInput, { target: { value: 'New English caption' } });

    expect(mockOnChangeImage).toHaveBeenCalledTimes(1);
    expect(mockOnChangeImage).toHaveBeenCalledWith({
      ...mockImage,
      caption: {
        uk: 'Тестовий підпис',
        en: 'New English caption'
      }
    });
  });

  it('calls onChangeImage with updated alt text passed directly as a string', () => {
    render(<CarouselImageCard image={mockImage} currentLocale="uk" onChangeImage={mockOnChangeImage} />);

    fireEvent.click(screen.getByTestId('direct-string-btn-Альтернативний текст'));

    expect(mockOnChangeImage).toHaveBeenCalledWith({
      ...mockImage,
      alt: {
        uk: 'Пряме значення рядком',
        en: 'Test alt'
      }
    });
  });

  it('calls onChangeImage with updated caption passed directly as a string', () => {
    render(<CarouselImageCard image={mockImage} currentLocale="en" onChangeImage={mockOnChangeImage} />);

    fireEvent.click(screen.getByTestId('direct-string-btn-Підпис під фото'));

    expect(mockOnChangeImage).toHaveBeenCalledWith({
      ...mockImage,
      caption: {
        uk: 'Тестовий підпис',
        en: 'Пряме значення рядком'
      }
    });
  });

  it('falls back to empty string when the change event has no value', () => {
    render(<CarouselImageCard image={mockImage} currentLocale="uk" onChangeImage={mockOnChangeImage} />);

    fireEvent.click(screen.getByTestId('empty-string-btn-Альтернативний текст'));

    expect(mockOnChangeImage).toHaveBeenCalledWith({
      ...mockImage,
      alt: {
        uk: '',
        en: 'Test alt'
      }
    });
  });

  it('falls back to empty strings for alt/caption when the image has no existing localized values', () => {
    const bareImage: CarouselImageData = { id: 5, src: '/images/bare.jpg', alt: {} as any, caption: {} as any };
    render(<CarouselImageCard image={bareImage} currentLocale="uk" onChangeImage={mockOnChangeImage} />);

    fireEvent.click(screen.getByTestId('direct-string-btn-Альтернативний текст'));

    expect(mockOnChangeImage).toHaveBeenCalledWith({
      ...bareImage,
      alt: {
        uk: 'Пряме значення рядком',
        en: ''
      }
    });
  });

  it('calls onChangeImage with new file URL and crop data when image is changed', () => {
    render(<CarouselImageCard image={mockImage} currentLocale="uk" onChangeImage={mockOnChangeImage} />);

    const changeButton = screen.getByTestId('mock-change-image-btn');
    fireEvent.click(changeButton);

    expect(mockOnChangeImage).toHaveBeenCalledTimes(1);
    expect(mockOnChangeImage).toHaveBeenCalledWith({
      ...mockImage,
      src: 'https://new-image.com/img.jpg',
      alt: {
        uk: 'Тестовий альт',
        en: 'Test alt'
      },
      crop: { rect: { x: 0, y: 0, width: 100, height: 100 } }
    });
  });

  it('sets crop to null when no crop data is provided on file change', () => {
    render(<CarouselImageCard image={mockImage} currentLocale="uk" onChangeImage={mockOnChangeImage} />);

    fireEvent.click(screen.getByTestId('mock-change-image-no-crop-btn'));

    expect(mockOnChangeImage).toHaveBeenCalledWith({
      ...mockImage,
      src: 'https://no-crop.com/img.jpg',
      alt: {
        uk: 'Тестовий альт',
        en: 'Test alt'
      },
      crop: null
    });
  });

  it('falls back to default "Carousel image" alt text when no alt exists for the current locale on file change', () => {
    const bareImage: CarouselImageData = { id: 7, src: '', alt: {} as any };
    render(<CarouselImageCard image={bareImage} currentLocale="uk" onChangeImage={mockOnChangeImage} />);

    fireEvent.click(screen.getByTestId('mock-change-image-no-crop-btn'));

    expect(mockOnChangeImage).toHaveBeenCalledWith({
      ...bareImage,
      src: 'https://no-crop.com/img.jpg',
      alt: {
        uk: 'Carousel image',
        en: ''
      },
      crop: null
    });
  });
});
