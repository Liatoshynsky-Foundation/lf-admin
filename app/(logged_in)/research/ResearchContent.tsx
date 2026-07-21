import type { ResearchWork } from './research.mock';
import { ResearchTable } from './ResearchTable';
import {
  RESEARCH_EMPTY_STATE_DESCRIPTION,
  RESEARCH_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  RESEARCH_EMPTY_STATE_NO_RESULTS_TITLE,
  RESEARCH_EMPTY_STATE_TITLE
} from '~/constants/research';
import { EmptyState } from '~/shared/components/empty-state';

type ResearchContentProps = Readonly<{
  visibleWorks: readonly ResearchWork[];
  hasActiveCriteria: boolean;
}>;

export function ResearchContent({ visibleWorks, hasActiveCriteria }: ResearchContentProps) {
  if (visibleWorks.length === 0) {
    return (
      <EmptyState
        title={hasActiveCriteria ? RESEARCH_EMPTY_STATE_NO_RESULTS_TITLE : RESEARCH_EMPTY_STATE_TITLE}
        description={hasActiveCriteria ? RESEARCH_EMPTY_STATE_NO_RESULTS_DESCRIPTION : RESEARCH_EMPTY_STATE_DESCRIPTION}
      />
    );
  }

  return <ResearchTable works={visibleWorks} />;
}
