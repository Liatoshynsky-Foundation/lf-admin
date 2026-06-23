import { render, screen } from '@testing-library/react';
import { Box } from 'lucide-react';
import React from 'react';

import { StatusBadge } from './StatusBadge';
import { BaseContentStatuses } from '~/types/enums/common.enums';

jest.mock('~/shared/components/badge/Badge', () => ({
  __esModule: true,
  default: ({ variant }: { variant: string }) => (
    <Box data-testid="mock-badge" data-variant={variant}>
      Status: {variant}
    </Box>
  )
}));

describe('StatusBadge', () => {
  it('should pass "Draft" variant to Badge when status is Draft', () => {
    render(<StatusBadge status={BaseContentStatuses.Draft} />);

    const badge = screen.getByTestId('mock-badge');

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', BaseContentStatuses.Draft);
    expect(badge).toHaveTextContent(`Status: ${BaseContentStatuses.Draft}`);
  });

  it('should pass "Published" variant to Badge when status is Published', () => {
    render(<StatusBadge status={BaseContentStatuses.Published} />);

    const badge = screen.getByTestId('mock-badge');

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', BaseContentStatuses.Published);
    expect(badge).toHaveTextContent(`Status: ${BaseContentStatuses.Published}`);
  });

  it('should normalize other statuses to "Published" variant', () => {
    const fallbackStatus = 'SOME_OTHER_STATUS' as BaseContentStatuses;

    render(<StatusBadge status={fallbackStatus} />);

    const badge = screen.getByTestId('mock-badge');

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', BaseContentStatuses.Published);
    expect(badge).toHaveTextContent(`Status: ${BaseContentStatuses.Published}`);
  });
});
