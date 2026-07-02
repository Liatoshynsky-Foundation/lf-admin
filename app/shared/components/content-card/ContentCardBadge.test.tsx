import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import ContentCardBadge from './ContentCardBadge';
import { BaseContentStatuses } from '~/types/enums/common.enums';

jest.mock('../badge/Badge', () => ({
  __esModule: true,
  default: ({ variant, localizations }: { variant: string; localizations?: string[] }) => (
    <div data-testid="mock-badge" data-variant={variant} data-localizations={localizations?.join(',')}>
      Badge: {variant}
    </div>
  )
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
    localizations: ['en', 'fr']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the ContentCardBadge with provided props', () => {
    render(<ContentCardBadge {...mockProps} />);
    expect(screen.getAllByTestId('mock-badge')[0]).toBeInTheDocument();
  });

  it('should render the second Badge with "Published" variant when status is Published', () => {
    render(<ContentCardBadge {...mockProps} status={BaseContentStatuses.Published} />);

    const badges = screen.getAllByTestId('mock-badge');
    expect(badges).toHaveLength(2);
    expect(badges[1]).toHaveAttribute('data-variant', BaseContentStatuses.Published);
  });

  it('should normalize any other unknown status to "Hidden" variant', () => {
    render(<ContentCardBadge {...mockProps} status="SOME_UNKNOWN_STATUS" />);

    const badges = screen.getAllByTestId('mock-badge');
    expect(badges).toHaveLength(2);
    expect(badges[1]).toHaveAttribute('data-variant', BaseContentStatuses.Hidden);
  });

  it('should not render the status Badge if status is an empty string', () => {
    render(<ContentCardBadge {...mockProps} status="" />);

    const badges = screen.getAllByTestId('mock-badge');
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveAttribute('data-variant', mockProps.type);
  });
});
