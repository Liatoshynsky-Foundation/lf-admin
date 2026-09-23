import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { ResearchContent } from './ResearchContent';
import {
  RESEARCH_EMPTY_STATE_DESCRIPTION,
  RESEARCH_EMPTY_STATE_NO_RESULTS_TITLE,
  RESEARCH_EMPTY_STATE_NO_STATUS_RESULTS_TITLE,
  RESEARCH_EMPTY_STATE_TITLE
} from '~/constants/research';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import type { ResearchWork } from '~/types/researchWork';

jest.mock('./ResearchTable', () => ({
  ResearchTable: ({ works }: { works: readonly ResearchWork[] }) => (
    <div data-testid="mock-research-table">{works.length}</div>
  )
}));

jest.mock('~/shared/components/empty-state', () => ({
  EmptyState: ({ title, description }: { title: string; description?: string }) => (
    <div data-testid="mock-empty-state">
      <span>{title}</span>
      {description ? <span>{description}</span> : null}
    </div>
  )
}));

const sampleWork: ResearchWork = {
  id: '1',
  author: 'Коваленко Олена',
  bibliographicDescription: 'Коваленко, Олена. Тестовий бібліографічний опис.',
  year: '1970',
  keywords: '',
  status: BaseContentStatuses.Published,
  createdAt: '2025-09-01T10:00:00.000Z',
  updatedAt: '2025-09-11T10:00:00.000Z',
  publishedAt: '2025-09-11T10:00:00.000Z'
};

const emptyHandlers = {
  onEditWork: jest.fn(),
  onDeleteWork: jest.fn(),
  onToggleStatus: jest.fn()
};

describe('ResearchContent', () => {
  it('renders the research table when there are visible works', () => {
    render(
      <ResearchContent visibleWorks={[sampleWork]} emptyReason="none" {...emptyHandlers} />
    );

    expect(screen.getByTestId('mock-research-table')).toHaveTextContent('1');
    expect(screen.queryByTestId('mock-empty-state')).not.toBeInTheDocument();
  });

  it.each([
    {
      emptyReason: 'none' as const,
      title: RESEARCH_EMPTY_STATE_TITLE,
      description: RESEARCH_EMPTY_STATE_DESCRIPTION
    },
    {
      emptyReason: 'search' as const,
      title: RESEARCH_EMPTY_STATE_NO_RESULTS_TITLE
    },
    {
      emptyReason: 'status' as const,
      title: RESEARCH_EMPTY_STATE_NO_STATUS_RESULTS_TITLE
    }
  ])('shows empty copy for reason $emptyReason', ({ emptyReason, title, description }) => {
    render(<ResearchContent visibleWorks={[]} emptyReason={emptyReason} {...emptyHandlers} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    if (description) {
      expect(screen.getByText(description)).toBeInTheDocument();
    }
    expect(screen.queryByTestId('mock-research-table')).not.toBeInTheDocument();
  });
});
