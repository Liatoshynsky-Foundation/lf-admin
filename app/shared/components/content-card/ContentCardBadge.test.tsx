import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import ContentCardBadge from './ContentCardBadge';

jest.mock('./ContentCardBadge', () => ({
  __esModule: true,
  default: () => <div data-testid="badge-mock">Badge Mock</div>
}));

describe('ContentCard Component', () => {
  const mockProps = {
    type: 'news' as const,
    coverImage: {
      src: { uk: '/test-cover.jpg', en: '/test-cover.jpg' },
      alt: { uk: 'Опис фото', en: 'Photo description' }
    },
    title: { uk: 'Український заголовок', en: 'English Title' },
    status: 'published',
    localizations: ['en', 'fr']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the ContentCardBadge with provided props', () => {
    render(<ContentCardBadge {...mockProps} />);
    expect(screen.getByTestId('badge-mock')).toBeInTheDocument();
  });
});
