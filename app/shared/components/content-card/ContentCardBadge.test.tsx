import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

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

  it('should render the ContentCardBadge with provided props', () => {
    render(<ContentCard {...mockProps} />);
    expect(screen.getByTestId('badge-mock')).toBeInTheDocument();
  });
});
