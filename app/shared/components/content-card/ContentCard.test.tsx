import '@testing-library/jest-dom';
import { fireEvent,render, screen } from '@testing-library/react';

import ContentCard from './ContentCard';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} onClick={props.onClick} />;
  }
}));

jest.mock('./ContentCardBadge', () => ({
  __esModule: true,
  default: () => <div data-testid="badge">Badge Mock</div>
}));

describe('ContentCard Component', () => {
  const mockProps = {
    type: 'news' as const,
    coverImage: {
      src: '/img.jpg',
      alt: { uk: 'Опис фото', en: 'Photo alt' }
    },
    title: { uk: 'Заголовок новини', en: 'News title' },
    status: 'published',
    createdAt: '2024-01-01T10:00:00Z',
    publishedAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-03T10:00:00Z',
    onClick: jest.fn(),
    onClickMenu: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Ukrainian title and the cover image correctly', () => {
    render(<ContentCard {...mockProps} />);

    expect(screen.getByText('Заголовок новини')).toBeInTheDocument();
    const image = screen.getByAltText('Опис фото');
    expect(image).toHaveAttribute('src', '/img.jpg');
  });

  it('calls onClickMenu when the menu icon (ellipsis) is clicked', () => {
    render(<ContentCard {...mockProps} />);

    const menuIcon = screen.getByAltText('menu');
    fireEvent.click(menuIcon);

    expect(mockProps.onClickMenu).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when the "Edit" (Редагувати) button is clicked', () => {
    render(<ContentCard {...mockProps} />);

    const editButton = screen.getByRole('button', { name: /редагувати/i });
    fireEvent.click(editButton);

    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  describe('Status Logic', () => {
    it('displays "Edited" (Редаговано) if status is published and updatedAt exists', () => {
      render(<ContentCard {...mockProps} />);
      // Matches the Ukrainian string rendered by the component logic
      expect(screen.getByText(/Редаговано 03.01.2024/)).toBeInTheDocument();
    });

    it('displays "Published" (Опубліковано) if updatedAt is missing', () => {
      const propsWithoutUpdate = { ...mockProps, updatedAt: undefined };
      render(<ContentCard {...propsWithoutUpdate} />);
      expect(screen.getByText(/Опубліковано 02.01.2024/)).toBeInTheDocument();
    });

    it('displays "Created" (Створено) if status is draft', () => {
      render(<ContentCard {...mockProps} status="draft" />);
      expect(screen.getByText(/Створено 01.01.2024/)).toBeInTheDocument();
    });
  });
});
