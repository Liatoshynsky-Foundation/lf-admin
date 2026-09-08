import { renderHook } from '@testing-library/react';

import { BaseContentStatuses } from '~/types/enums/common.enums';
import type { CaseFiltersInput, CaseStatus } from '~/types/graphql/generated/graphql';

const mockUseAllCasesQuery = jest.fn();

jest.mock('~/types/graphql/generated/graphql', () => ({
  __esModule: true,
  useAllCasesQuery: (...args: unknown[]) => mockUseAllCasesQuery(...args)
}));

import { useAllCases } from './useCases';

const createMockAllCasesNode = (
  overrides: Partial<{
    id: string;
    fundId: string;
    descriptionNumber: number;
    caseNumber: number;
    caseName: { uk: string; en: string };
    caseDate: { uk: string; en: string };
    sheetsNumber: number;
    status: string;
    updatedAt: string;
    createdAt: string;
  }> = {}
) => ({
  id: '1',
  fundId: 'fund-1',
  descriptionNumber: 1,
  caseNumber: 12,
  caseName: { uk: 'Справа', en: 'Case' },
  caseDate: { uk: '1920-1930', en: '1920-1930' },
  sheetsNumber: 5,
  status: 'published',
  updatedAt: '2023-01-01',
  createdAt: '2022-01-01',
  ...overrides
});

describe('useCases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAllCases', () => {
    it('should map allCases entries to list items', () => {
      mockUseAllCasesQuery.mockReturnValue({
        data: { allCases: [createMockAllCasesNode()] },
        loading: false,
        error: undefined
      });

      const { result } = renderHook(() => useAllCases());

      expect(result.current.cases).toEqual([
        {
          id: '1',
          name: 'Справа',
          fundId: 'fund-1',
          descriptionNumber: 1,
          caseNumber: 12,
          sheetsNumber: 5,
          status: BaseContentStatuses.Published,
          dates: '1920-1930',
          updatedAt: '2023-01-01',
          createdAt: '2022-01-01'
        }
      ]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it('should default unrecognised statuses to Hidden', () => {
      mockUseAllCasesQuery.mockReturnValue({
        data: {
          allCases: [
            createMockAllCasesNode({
              caseNumber: 1,
              caseDate: { uk: '1901', en: '1901' },
              sheetsNumber: 1,
              status: 'not-a-real-status'
            })
          ]
        },
        loading: false,
        error: undefined
      });

      const { result } = renderHook(() => useAllCases());

      expect(result.current.cases[0].status).toBe(BaseContentStatuses.Hidden);
    });

    it('should return an empty array when allCases is missing', () => {
      mockUseAllCasesQuery.mockReturnValue({ data: undefined, loading: true, error: undefined });

      const { result } = renderHook(() => useAllCases());

      expect(result.current.cases).toEqual([]);
      expect(result.current.loading).toBe(true);
    });

    it('should pass filters through as query variables', () => {
      mockUseAllCasesQuery.mockReturnValue({ data: undefined, loading: false, error: undefined });
      const filters: CaseFiltersInput = { search: 'foo', statuses: ['published' as CaseStatus] };

      renderHook(() => useAllCases(filters));

      expect(mockUseAllCasesQuery).toHaveBeenCalledWith({
        variables: { filters },
        fetchPolicy: 'network-only',
        skip: undefined
      });
    });

    it('should pass skip through to the query when provided', () => {
      mockUseAllCasesQuery.mockReturnValue({ data: undefined, loading: false, error: undefined });

      renderHook(() => useAllCases(null, { skip: true }));

      expect(mockUseAllCasesQuery).toHaveBeenCalledWith({
        variables: { filters: null },
        fetchPolicy: 'network-only',
        skip: true
      });
    });
  });
});
