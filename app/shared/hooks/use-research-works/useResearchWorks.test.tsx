import { renderHook } from '@testing-library/react';

import { collectUniqueAuthors, useResearchWorkById } from './useResearchWorks';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { ResearchWorkStatus, useResearchWorkByIdQuery } from '~/types/graphql/generated/graphql';

jest.mock('~/types/graphql/generated/graphql', () => ({
  ...jest.requireActual('~/types/graphql/generated/graphql'),
  useResearchWorkByIdQuery: jest.fn()
}));

const mockUseResearchWorkByIdQuery = useResearchWorkByIdQuery as jest.MockedFunction<
  typeof useResearchWorkByIdQuery
>;

describe('collectUniqueAuthors', () => {
  it('returns unique trimmed authors sorted with uk locale', () => {
    expect(
      collectUniqueAuthors([
        { author: 'Мельник Андрій' },
        { author: 'Коваленко Олена' },
        { author: 'Мельник Андрій' },
        { author: '  ' },
        { author: ' Коваленко Олена ' }
      ])
    ).toEqual(['Коваленко Олена', 'Мельник Андрій']);
  });

  it('returns an empty list when there are no authors', () => {
    expect(collectUniqueAuthors([])).toEqual([]);
  });
});

describe('useResearchWorkById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips the query when id is null', () => {
    mockUseResearchWorkByIdQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined
    } as never);

    const { result } = renderHook(() => useResearchWorkById(null));

    expect(mockUseResearchWorkByIdQuery).toHaveBeenCalledWith({
      variables: { id: '' },
      skip: true,
      fetchPolicy: 'network-only'
    });
    expect(result.current.work).toBeNull();
  });

  it('maps research work when the query returns data', () => {
    mockUseResearchWorkByIdQuery.mockReturnValue({
      data: {
        researchWorkById: {
          id: 'work-1',
          bibliographicDescription: 'Опис',
          author: 'Коваленко Олена',
          year: '1970',
          keywords: 'ключ',
          pdfFile: null,
          url: null,
          status: ResearchWorkStatus.Published,
          publishedAt: '2025-09-11T10:00:00.000Z',
          createdAt: '2025-09-01T10:00:00.000Z',
          updatedAt: '2025-09-11T10:00:00.000Z'
        }
      },
      loading: false,
      error: undefined
    } as never);

    const { result } = renderHook(() => useResearchWorkById('work-1'));

    expect(mockUseResearchWorkByIdQuery).toHaveBeenCalledWith({
      variables: { id: 'work-1' },
      skip: false,
      fetchPolicy: 'network-only'
    });
    expect(result.current.work).toEqual({
      id: 'work-1',
      bibliographicDescription: 'Опис',
      author: 'Коваленко Олена',
      year: '1970',
      keywords: 'ключ',
      pdfFile: undefined,
      url: undefined,
      status: BaseContentStatuses.Published,
      publishedAt: '2025-09-11T10:00:00.000Z',
      createdAt: '2025-09-01T10:00:00.000Z',
      updatedAt: '2025-09-11T10:00:00.000Z'
    });
  });
});
