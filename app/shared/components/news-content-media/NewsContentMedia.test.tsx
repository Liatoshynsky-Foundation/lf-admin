import { render, screen } from '@testing-library/react';

import { NewsContentMedia } from './NewsContentMedia';

describe('NewsContentMedia', () => {
  const mockEnglishContent = {
    title: 'English Title',
    description: 'English Description',
    content: 'English Content'
  };

  const mockUkrainianContent = {
    title: 'Українська назва',
    description: 'Український опис',
    content: 'Український контент'
  };

  const mockCoverImage = {
    src: '/test-image.jpg',
    alt: 'Test Image'
  };

  it('renders cover image section', () => {
    render(
      <NewsContentMedia
        englishContent={mockEnglishContent}
        ukrainianContent={mockUkrainianContent}
        coverImage={mockCoverImage}
      />
    );

    expect(screen.getByText('Зображення обкладинки')).toBeInTheDocument();
    const image = screen.getByAltText('Test Image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('displays placeholder when no cover image is provided', () => {
    render(<NewsContentMedia englishContent={mockEnglishContent} ukrainianContent={mockUkrainianContent} />);

    expect(screen.getByText('Зображення обкладинки не завантажено')).toBeInTheDocument();
  });

  it('renders Ukrainian content section', () => {
    render(
      <NewsContentMedia
        englishContent={mockEnglishContent}
        ukrainianContent={mockUkrainianContent}
        coverImage={mockCoverImage}
      />
    );

    expect(screen.getByText('🇺🇦 Українська')).toBeInTheDocument();
    expect(screen.getByText('Українська назва')).toBeInTheDocument();
    expect(screen.getByText('Український опис')).toBeInTheDocument();
    expect(screen.getByText('Український контент')).toBeInTheDocument();
  });

  it('renders English content section', () => {
    render(
      <NewsContentMedia
        englishContent={mockEnglishContent}
        ukrainianContent={mockUkrainianContent}
        coverImage={mockCoverImage}
      />
    );

    expect(screen.getByText('🇬🇧 English')).toBeInTheDocument();
    expect(screen.getByText('English Title')).toBeInTheDocument();
    expect(screen.getByText('English Description')).toBeInTheDocument();
    expect(screen.getByText('English Content')).toBeInTheDocument();
  });

  it('displays "Не вказано" for empty content fields', () => {
    const emptyContent = {
      title: '',
      description: '',
      content: ''
    };

    render(
      <NewsContentMedia englishContent={emptyContent} ukrainianContent={emptyContent} coverImage={mockCoverImage} />
    );

    const notSpecifiedElements = screen.getAllByText('Не вказано');
    expect(notSpecifiedElements.length).toBeGreaterThan(0);
  });
});
