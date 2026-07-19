import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

import type { ResearchWork } from './research.mock';
import { ResearchContent } from './ResearchContent';
import { BaseContentStatuses } from '~/types/enums/common.enums';

jest.mock('./ResearchTable', () => ({
  ResearchTable: ({ works }: { works: readonly ResearchWork[] }) => (
    <div data-testid="mock-research-table">{works.length}</div>
  )
}));

jest.mock('~/shared/components/empty-state', () => ({
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="mock-empty-state">
      <span>{title}</span>
      <span>{description}</span>
    </div>
  )
}));

const sampleWork: ResearchWork = {
  id: '1',
  author: 'Архимович Лідія',
  bibliographicDescription: 'Архимович, Лідія. Шляхи розвитку української радянської опери.',
  year: '1970',
  keywords: '',
  status: BaseContentStatuses.Published,
  createdAt: '2025-09-01T10:00:00.000Z',
  updatedAt: '2025-09-11T10:00:00.000Z',
  publishedAt: '2025-09-11T10:00:00.000Z'
};

describe('ResearchContent', () => {
  it('renders the research table when there are visible works', () => {
    render(<ResearchContent visibleWorks={[sampleWork]} hasActiveCriteria={false} />);

    expect(screen.getByTestId('mock-research-table')).toHaveTextContent('1');
    expect(screen.queryByTestId('mock-empty-state')).not.toBeInTheDocument();
  });

  it('shows the default empty state when there are no works and no active criteria', () => {
    render(<ResearchContent visibleWorks={[]} hasActiveCriteria={false} />);

    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
    expect(screen.getByText('Наукових робіт ще немає.')).toBeInTheDocument();
    expect(
      screen.getByText('Наукових робіт ще немає. Натисніть «Додати роботу», щоб створити перший запис.')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('mock-research-table')).not.toBeInTheDocument();
  });

  it('shows the no-results empty state when there are no works but search or filters are active', () => {
    render(<ResearchContent visibleWorks={[]} hasActiveCriteria />);

    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
    expect(screen.getByText('Нічого не знайдено')).toBeInTheDocument();
    expect(screen.getByText('Спробуйте змінити параметри пошуку або фільтрів.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-research-table')).not.toBeInTheDocument();
  });
});
