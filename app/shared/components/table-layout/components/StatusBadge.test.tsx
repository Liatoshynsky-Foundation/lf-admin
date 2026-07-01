import { Box } from '@mui/material';
import { render, screen } from '@testing-library/react';
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

jest.mock('../../design-system/tooltip/Tooltip', () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Box data-testid="mock-tooltip" data-title={title}>
      {children}
    </Box>
  )
}));

describe('StatusBadge', () => {
  it('should pass "Draft" variant to Badge when status is Hidden', () => {
    render(<StatusBadge status={BaseContentStatuses.Draft} />);

    const badge = screen.getByTestId('mock-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', BaseContentStatuses.Hidden);
  });

  it('should pass "Published" variant to Badge when status is Published', () => {
    render(<StatusBadge status={BaseContentStatuses.Published} />);

    const badge = screen.getByTestId('mock-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', BaseContentStatuses.Published);
  });

  it('should normalize other statuses to "Published" variant', () => {
    const fallbackStatus = 'SOME_OTHER_STATUS' as BaseContentStatuses;
    render(<StatusBadge status={fallbackStatus} />);

    const badge = screen.getByTestId('mock-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', BaseContentStatuses.Published);
  });

  it('should not wrap in tooltip if updatedAt is missing', () => {
    render(<StatusBadge status={BaseContentStatuses.Draft} />);

    const tooltip = screen.queryByTestId('mock-tooltip');
    const badge = screen.getByTestId('mock-badge');

    expect(tooltip).not.toBeInTheDocument();
    expect(badge).toBeInTheDocument();
  });

  it('should show "Редаговано [date]" when status is Draft and updatedAt is provided', () => {
    const mockDate = '2026-06-25T12:00:00.000Z';
    const expectedLocalizedDate = new Date(mockDate).toLocaleDateString('uk-UA');

    render(<StatusBadge status={BaseContentStatuses.Draft} updatedAt={mockDate} />);

    const tooltip = screen.getByTestId('mock-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute('data-title', `Редаговано ${expectedLocalizedDate}`);
  });

  it('should show "Опубліковано [date]" when status is Published and updatedAt is provided', () => {
    const mockDate = '2026-06-25T12:00:00.000Z';
    const expectedLocalizedDate = new Date(mockDate).toLocaleDateString('uk-UA');

    render(<StatusBadge status={BaseContentStatuses.Published} updatedAt={mockDate} />);

    const tooltip = screen.getByTestId('mock-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute('data-title', `Опубліковано ${expectedLocalizedDate}`);
  });
});
