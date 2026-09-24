import { mapResearchWork, toGqlResearchWorkStatus, toUiResearchWorkStatus } from './researchWorkMappers';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  type ResearchWorkFieldsFragment,
  ResearchWorkStatus as GqlResearchWorkStatus
} from '~/types/graphql/generated/graphql';

describe('researchWorkMappers', () => {
  it('maps GraphQL status to UI status', () => {
    expect(toUiResearchWorkStatus(GqlResearchWorkStatus.Published)).toBe(BaseContentStatuses.Published);
    expect(toUiResearchWorkStatus(GqlResearchWorkStatus.Hidden)).toBe(BaseContentStatuses.Hidden);
  });

  it('maps UI status to GraphQL status', () => {
    expect(toGqlResearchWorkStatus(BaseContentStatuses.Published)).toBe(GqlResearchWorkStatus.Published);
    expect(toGqlResearchWorkStatus(BaseContentStatuses.Hidden)).toBe(GqlResearchWorkStatus.Hidden);
    expect(toGqlResearchWorkStatus('draft' as never)).toBeNull();
  });

  it('maps a research work fragment to the UI model', () => {
    const item = {
      id: '1',
      author: 'Author',
      bibliographicDescription: 'Desc',
      year: '2020',
      keywords: null,
      url: null,
      pdfFile: null,
      status: GqlResearchWorkStatus.Published,
      createdAt: '2020-01-01',
      updatedAt: '2020-01-02',
      publishedAt: null
    } as ResearchWorkFieldsFragment;

    expect(mapResearchWork(item)).toMatchObject({
      id: '1',
      keywords: '',
      url: undefined,
      pdfFile: undefined,
      status: BaseContentStatuses.Published,
      publishedAt: undefined
    });
  });
});
