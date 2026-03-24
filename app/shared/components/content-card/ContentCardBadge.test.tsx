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
  default: () => <div data-testid="badge-mock">Badge Mock</div>
}));

describe('ContentCard Component', () => {
  const mockProps = {
    type: 'news' as const,
    coverImage: {
      src: '/test-cover.jpg',
      alt: { uk: 'Опис фото', en: 'Photo description' }
    },
    title: { uk: 'Український заголовок', en: 'English Title' },
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

  it('should render the Ukrainian title and cover image correctly', () => {
    render(<ContentCard {...mockProps} />);

    expect(screen.getByText('Український заголовок')).toBeInTheDocument();
    const image = screen.getByAltText('Опис фото');
    expect(image).toHaveAttribute('src', '/test-cover.jpg');
  });

  it('should call onClickMenu when the menu icon (ellipsis) is clicked', () => {
    render(<ContentCard {...mockProps} />);

    const menuIcon = screen.getByAltText('menu');
    fireEvent.click(menuIcon);

    expect(mockProps.onClickMenu).toHaveBeenCalledTimes(1);
  });

  it('should call onClick when the "Редагувати" button is clicked', () => {
    render(<ContentCard {...mockProps} />);

    const editButton = screen.getByRole('button', { name: /редагувати/i });
    fireEvent.click(editButton);

    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  describe('Status Logic Rendering', () => {
    it('should display "Редаговано" with the formatted updatedAt date if status is published', () => {
      render(<ContentCard {...mockProps} />);
      expect(screen.getByText(/Редаговано 03.01.2024/)).toBeInTheDocument();
    });

    it('should display "Опубліковано" with the publishedAt date if updatedAt is missing', () => {
      const propsWithoutUpdate = { ...mockProps, updatedAt: undefined };
      render(<ContentCard {...propsWithoutUpdate} />);
      expect(screen.getByText(/Опубліковано 02.01.2024/)).toBeInTheDocument();
    });

    it('should display "Створено" with the createdAt date if status is draft', () => {
      render(<ContentCard {...mockProps} status="draft" />);
      expect(screen.getByText(/Створено 01.01.2024/)).toBeInTheDocument();
    });
  });

  it('should render the ContentCardBadge with provided props', () => {
    render(<ContentCard {...mockProps} />);
    expect(screen.getByTestId('badge-mock')).toBeInTheDocument();
  });
});
