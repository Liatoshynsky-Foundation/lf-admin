import { render, screen } from '@testing-library/react';
import React from 'react';

import { BaseContentStatuses } from '../../../types/enums/common.enums';
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

describe('ContentCardBadge', () => {
  const defaultProps = {
    type: 'default' as unknown as never,
    localizations: ['en', 'uk']
  };

  test('renders with Published status', () => {
    render(<ContentCardBadge {...defaultProps} status={BaseContentStatuses.Published} />);

    expect(screen.getByTestId('badge-published')).toBeInTheDocument();
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
