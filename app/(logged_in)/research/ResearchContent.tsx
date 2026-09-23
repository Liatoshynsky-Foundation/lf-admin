import { ResearchTable } from './ResearchTable';
import {
  RESEARCH_EMPTY_STATE_DESCRIPTION,
  RESEARCH_EMPTY_STATE_NO_RESULTS_TITLE,
  RESEARCH_EMPTY_STATE_NO_STATUS_RESULTS_TITLE,
  RESEARCH_EMPTY_STATE_TITLE
} from '~/constants/research';
import { EmptyState } from '~/shared/components/empty-state';
import type { ResearchWork } from '~/types/researchWork';

export type ResearchEmptyReason = 'none' | 'search' | 'status';

type ResearchContentProps = Readonly<{
  visibleWorks: readonly ResearchWork[];
  emptyReason: ResearchEmptyReason;
  onEditWork: (work: ResearchWork) => void;
  onDeleteWork: (work: ResearchWork) => void;
  onToggleStatus: (work: ResearchWork) => void;
  onShareWork: (work: ResearchWork) => void;
}>;

const emptyStateForReason = (emptyReason: ResearchEmptyReason) => {
  if (emptyReason === 'search') {
    return { title: RESEARCH_EMPTY_STATE_NO_RESULTS_TITLE };
  }
  if (emptyReason === 'status') {
    return { title: RESEARCH_EMPTY_STATE_NO_STATUS_RESULTS_TITLE };
  }
  return {
    title: RESEARCH_EMPTY_STATE_TITLE,
    description: RESEARCH_EMPTY_STATE_DESCRIPTION
  };
};

export function ResearchContent({
  visibleWorks,
  emptyReason,
  onEditWork,
  onDeleteWork,
  onToggleStatus,
  onShareWork
}: ResearchContentProps) {
  if (visibleWorks.length === 0) {
    const emptyState = emptyStateForReason(emptyReason);
    return <EmptyState title={emptyState.title} description={emptyState.description ?? ''} />;
  }

  return (
    <ResearchTable
      works={visibleWorks}
      onEditWork={onEditWork}
      onDeleteWork={onDeleteWork}
      onToggleStatus={onToggleStatus}
      onShareWork={onShareWork}
    />
  );
}
