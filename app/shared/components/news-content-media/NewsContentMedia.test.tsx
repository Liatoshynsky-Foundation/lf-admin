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

  it('displays placeholder when no cover image is provided', () => {
    render(<NewsContentMedia englishContent={mockEnglishContent} ukrainianContent={mockUkrainianContent} />);

    const placeholders = screen.getAllByText('Зображення обкладинки не завантажено');
    expect(placeholders).toHaveLength(2); // One for UK section, one for EN section
  });

  it('renders Ukrainian content section', () => {
    render(
      <NewsContentMedia
        englishContent={mockEnglishContent}
        ukrainianContent={mockUkrainianContent}
        coverImage={mockCoverImage}
      />
    );

    expect(screen.getByText('Українська назва')).toBeInTheDocument();
    expect(screen.getByText('Український опис')).toBeInTheDocument();
  });

  it('renders English content section', () => {
    render(
      <NewsContentMedia
        englishContent={mockEnglishContent}
        ukrainianContent={mockUkrainianContent}
        coverImage={mockCoverImage}
      />
    );

    expect(screen.getByText('English Title')).toBeInTheDocument();
    expect(screen.getByText('English Description')).toBeInTheDocument();
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
