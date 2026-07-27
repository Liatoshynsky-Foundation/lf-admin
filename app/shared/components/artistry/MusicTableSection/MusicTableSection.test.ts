import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { MusicTableSection } from './MusicTableSection';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';

jest.mock('~/shared/hooks/use-page-block/usePageBlock');

jest.mock('~/shared/components/edit-block-skeleton/EditBlockSkeleton', () => ({
  EditBlockSkeleton: () => React.createElement('div', { 'data-testid': 'skeleton' }, 'Skeleton')
}));

jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'collapsible-block' }, React.createElement('h2', null, title), children)
}));

describe('MusicTableSection Component', () => {
  const mockUsePageBlock = usePageBlock as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render EditBlockSkeleton when block is undefined', () => {
    mockUsePageBlock.mockReturnValue({ block: undefined });

    render(React.createElement(MusicTableSection));

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('should render block content and link to creativity page when block exists', () => {
    mockUsePageBlock.mockReturnValue({ block: {} });

    render(React.createElement(MusicTableSection));

    expect(screen.getByText('Таблиця музичних творів')).toBeInTheDocument();
    expect(screen.getByText(/Цей блок динамічно завантажує таблицю композицій/)).toBeInTheDocument();

    const linkButton = screen.getByRole('link', { name: /Перейти до управління творами/i });
    expect(linkButton).toBeInTheDocument();
    expect(linkButton).toHaveAttribute('href', '/creativity');
  });
});
