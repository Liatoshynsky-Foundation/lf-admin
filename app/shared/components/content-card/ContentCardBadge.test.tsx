import { render, screen } from '@testing-library/react';
import React from 'react';

import { BaseContentStatuses } from '../../../types/enums/common.enums';
import ContentCardBadge from './ContentCardBadge';

jest.mock('../badge/Badge', () => ({
  __esModule: true,
  default: ({ variant }: { variant: string }) => <div data-testid={`badge-${variant}`} />
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

  test('renders with Draft status', () => {
    render(<ContentCardBadge {...defaultProps} status={BaseContentStatuses.Draft} />);

    expect(screen.getByTestId('badge-draft')).toBeInTheDocument();
  });

  test('does not render status badge if status is unknown', () => {
    render(<ContentCardBadge {...defaultProps} status={'some-random-status' as unknown as BaseContentStatuses} />);

    expect(screen.queryByTestId('badge-published')).not.toBeInTheDocument();
    expect(screen.queryByTestId('badge-draft')).not.toBeInTheDocument();
  });
});
