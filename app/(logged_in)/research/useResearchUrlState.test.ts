import { act, renderHook } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useResearchUrlState } from './useResearchUrlState';
import { RESEARCH_WORK_ID_PARAM } from '~/constants/research';
import { useResearchWorkById } from '~/shared/hooks/use-research-works/useResearchWorks';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import type { ResearchWork } from '~/types/researchWork';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn()
}));

jest.mock('~/shared/hooks/use-research-works/useResearchWorks', () => ({
  useResearchWorkById: jest.fn()
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockUseResearchWorkById = useResearchWorkById as jest.MockedFunction<typeof useResearchWorkById>;

const sampleWork: ResearchWork = {
  id: 'work-1',
  author: 'Коваленко Олена',
  bibliographicDescription: 'Опис',
  year: '1970',
  keywords: '',
  status: BaseContentStatuses.Published,
  createdAt: '2025-09-01T10:00:00.000Z',
  updatedAt: '2025-09-11T10:00:00.000Z',
  publishedAt: '2025-09-11T10:00:00.000Z'
};

describe('useResearchUrlState', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn()
    } as never);
    mockUsePathname.mockReturnValue('/research');
    mockUseSearchParams.mockReturnValue(new URLSearchParams() as never);
    mockUseResearchWorkById.mockReturnValue({
      work: null,
      loading: false,
      error: undefined
    });
  });

  it('returns empty state when research-work-id param is absent', () => {
    const { result } = renderHook(() => useResearchUrlState());

    expect(result.current.workIdFromUrl).toBeNull();
    expect(result.current.workFromUrl).toBeNull();
    expect(result.current.isLoadingFromUrl).toBe(false);
    expect(result.current.urlWorkError).toBeUndefined();
    expect(mockUseResearchWorkById).toHaveBeenCalledWith(null);
  });

  it('loads work when research-work-id is present', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`${RESEARCH_WORK_ID_PARAM}=work-1`) as never
    );
    mockUseResearchWorkById.mockReturnValue({
      work: sampleWork,
      loading: false,
      error: undefined
    });

    const { result } = renderHook(() => useResearchUrlState());

    expect(result.current.workIdFromUrl).toBe('work-1');
    expect(result.current.workFromUrl).toEqual(sampleWork);
    expect(result.current.urlWorkError).toBeUndefined();
    expect(mockUseResearchWorkById).toHaveBeenCalledWith('work-1');
  });

  it('exposes query error from useResearchWorkById', () => {
    const queryError = new Error('network down');
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`${RESEARCH_WORK_ID_PARAM}=work-1`) as never
    );
    mockUseResearchWorkById.mockReturnValue({
      work: null,
      loading: false,
      error: queryError
    });

    const { result } = renderHook(() => useResearchUrlState());

    expect(result.current.workFromUrl).toBeNull();
    expect(result.current.urlWorkError).toBe(queryError);
  });

  it('writes research-work-id into the url', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('filter=published') as never);

    const { result } = renderHook(() => useResearchUrlState());

    act(() => {
      result.current.setWorkIdInUrl('work-1');
    });

    expect(mockReplace).toHaveBeenCalledWith(
      `/research?filter=published&${RESEARCH_WORK_ID_PARAM}=work-1`,
      { scroll: false }
    );
  });

  it('removes research-work-id from the url', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`${RESEARCH_WORK_ID_PARAM}=work-1`) as never
    );

    const { result } = renderHook(() => useResearchUrlState());

    act(() => {
      result.current.setWorkIdInUrl(null);
    });

    expect(mockReplace).toHaveBeenCalledWith('/research', { scroll: false });
  });
});
