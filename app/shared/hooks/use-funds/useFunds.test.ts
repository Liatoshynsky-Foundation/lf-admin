import { renderHook } from '@testing-library/react';

import { FundErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { SortOrder } from '~/types/graphql/generated/graphql';

const mockUseFundByIdQuery = jest.fn();
const mockUseAllFundsQuery = jest.fn();
const mockUsePaginatedFundsQuery = jest.fn();
const mockUseCreateFundMutation = jest.fn();
const mockUseUpdateFundMutation = jest.fn();
const mockUseDeleteFundMutation = jest.fn();
const mockUseAllCasesQuery = jest.fn();
const mockUseCreateCaseMutation = jest.fn();
const mockUseUpdateCaseMutation = jest.fn();
const mockUseDeleteCaseMutation = jest.fn();
const mockApolloQuery = jest.fn();

jest.mock('@apollo/client', () => ({
  __esModule: true,
  gql: (strings: TemplateStringsArray) => strings.join(''),
  useApolloClient: () => ({ query: mockApolloQuery })
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  __esModule: true,
  SortOrder: { Asc: 'ASC', Desc: 'DESC' },
  useFundByIdQuery: (...args: unknown[]) => mockUseFundByIdQuery(...args),
  useAllFundsQuery: (...args: unknown[]) => mockUseAllFundsQuery(...args),
  usePaginatedFundsQuery: (...args: unknown[]) => mockUsePaginatedFundsQuery(...args),
  useCreateFundMutation: (...args: unknown[]) => mockUseCreateFundMutation(...args),
  useUpdateFundMutation: (...args: unknown[]) => mockUseUpdateFundMutation(...args),
  useDeleteFundMutation: (...args: unknown[]) => mockUseDeleteFundMutation(...args),
  useAllCasesQuery: (...args: unknown[]) => mockUseAllCasesQuery(...args),
  useCreateCaseMutation: (...args: unknown[]) => mockUseCreateCaseMutation(...args),
  useUpdateCaseMutation: (...args: unknown[]) => mockUseUpdateCaseMutation(...args),
  useDeleteCaseMutation: (...args: unknown[]) => mockUseDeleteCaseMutation(...args),
}));

jest.mock('~/lib/utils/safeMutate', () => ({
  __esModule: true,
  safeMutate: jest.fn()
}));

import {
  useAllFunds,
  useCasesByFundId,
  useCreateCase,
  useCreateFund,
  useDeleteCase,
  useDeleteFund,
  useFundById,
  useHasPublishedCasesInFund,
  usePaginatedFunds,
  useUpdateCase,
  useUpdateFund
} from './useFunds';

const mockedSafeMutate = safeMutate as jest.MockedFunction<typeof safeMutate>;

describe('useFunds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useFundById', () => {
    it('should query with the given id, network-only policy, and skip when id is empty', () => {
      mockUseFundByIdQuery.mockReturnValue({ data: undefined });

      renderHook(() => useFundById('', {}));

      expect(mockUseFundByIdQuery).toHaveBeenCalledWith({
        variables: { id: '' },
        fetchPolicy: 'network-only',
        skip: true
      });
    });

    it('should not skip when an id is present and skip option is not set', () => {
      mockUseFundByIdQuery.mockReturnValue({ data: undefined });

      renderHook(() => useFundById('abc'));

      expect(mockUseFundByIdQuery).toHaveBeenCalledWith({
        variables: { id: 'abc' },
        fetchPolicy: 'network-only',
        skip: false
      });
    });

    it('should skip when explicitly requested, even with a valid id', () => {
      mockUseFundByIdQuery.mockReturnValue({ data: undefined });

      renderHook(() => useFundById('abc', { skip: true }));

      expect(mockUseFundByIdQuery).toHaveBeenCalledWith({
        variables: { id: 'abc' },
        fetchPolicy: 'network-only',
        skip: true
      });
    });
  });

  describe('useCasesByFundId', () => {
    it('should query all cases with fundId filter and sort order when fundId is provided', () => {
      const mockRefetch = jest.fn();
      mockUseAllCasesQuery.mockReturnValue({
        data: { allCases: [{ id: 'case-1' }] },
        loading: false,
        error: undefined,
        refetch: mockRefetch
      });

      const { result } = renderHook(() => useCasesByFundId('fund-1'));

      expect(mockUseAllCasesQuery).toHaveBeenCalledWith({
        variables: { filters: { fundId: 'fund-1', sort: [{ field: 'order', order: SortOrder.Asc }] } },
        fetchPolicy: 'network-only',
        skip: false
      });
      expect(result.current.cases).toEqual([{ id: 'case-1' }]);
      expect(result.current.loading).toBe(false);
    });

    it('should skip query and return an empty array if fundId is undefined', () => {
      mockUseAllCasesQuery.mockReturnValue({
        data: undefined,
        loading: true,
        error: undefined,
        refetch: jest.fn()
      });

      const { result } = renderHook(() => useCasesByFundId(undefined));

      expect(mockUseAllCasesQuery).toHaveBeenCalledWith({
        variables: { filters: undefined },
        fetchPolicy: 'network-only',
        skip: true
      });
      expect(result.current.cases).toEqual([]);
      expect(result.current.loading).toBe(true);
    });
  });

  describe('useAllFunds', () => {
    it('should map findAllFunds entries, preferring chronologicalBoundaries over documentCreationDate', () => {
      mockUseAllFundsQuery.mockReturnValue({
        data: {
          findAllFunds: [
            {
              id: '1',
              fundNumber: 1,
              name: { uk: 'Архів', en: 'Archive' },
              descriptionsCount: 2,
              casesCount: 3,
              chronologicalBoundaries: { uk: '1900-1920' },
              documentCreationDate: { uk: '1901' },
              status: 'published',
              updatedAt: '2023-01-01'
            }
          ]
        },
        loading: false,
        error: undefined
      });

      const { result } = renderHook(() => useAllFunds());

      expect(result.current.funds).toEqual([
        {
          id: '1',
          fundNumber: 1,
          name: 'Архів',
          descriptions: 2,
          cases: 3,
          dates: '1900-1920',
          status: BaseContentStatuses.Published,
          updatedAt: '2023-01-01'
        }
      ]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it('should fall back to documentCreationDate when chronologicalBoundaries is missing', () => {
      mockUseAllFundsQuery.mockReturnValue({
        data: {
          findAllFunds: [
            {
              id: '1',
              fundNumber: 1,
              name: { uk: 'Архів', en: 'Archive' },
              descriptionsCount: 0,
              casesCount: 0,
              chronologicalBoundaries: undefined,
              documentCreationDate: { uk: '1901' },
              status: 'published',
              updatedAt: '2023-01-01'
            }
          ]
        },
        loading: false,
        error: undefined
      });

      const { result } = renderHook(() => useAllFunds());

      expect(result.current.funds[0].dates).toBe('1901');
    });

    it('should default unrecognised statuses to Hidden', () => {
      mockUseAllFundsQuery.mockReturnValue({
        data: {
          findAllFunds: [
            {
              id: '1',
              fundNumber: 1,
              name: { uk: 'Архів', en: 'Archive' },
              descriptionsCount: 0,
              casesCount: 0,
              documentCreationDate: { uk: '1901' },
              status: 'not-a-real-status',
              updatedAt: '2023-01-01'
            }
          ]
        },
        loading: false,
        error: undefined
      });

      const { result } = renderHook(() => useAllFunds());

      expect(result.current.funds[0].status).toBe(BaseContentStatuses.Hidden);
    });

    it('should return an empty array when findAllFunds is missing', () => {
      mockUseAllFundsQuery.mockReturnValue({ data: undefined, loading: true, error: undefined });

      const { result } = renderHook(() => useAllFunds());

      expect(result.current.funds).toEqual([]);
      expect(result.current.loading).toBe(true);
    });

    it('should pass filters through as query variables', () => {
      mockUseAllFundsQuery.mockReturnValue({ data: undefined, loading: false, error: undefined });
      const filters = { search: 'foo', statuses: null };

      renderHook(() => useAllFunds(filters));

      expect(mockUseAllFundsQuery).toHaveBeenCalledWith({
        variables: { filters },
        fetchPolicy: 'network-only'
      });
    });
  });

  describe('usePaginatedFunds', () => {
    it('should map findFundsPaginated items the same way as useAllFunds', () => {
      mockUsePaginatedFundsQuery.mockReturnValue({
        data: {
          findFundsPaginated: {
            items: [
              {
                id: '1',
                fundNumber: 1,
                name: { uk: 'Архів', en: 'Archive' },
                descriptionsCount: 2,
                casesCount: 3,
                chronologicalBoundaries: { uk: '1900-1920' },
                documentCreationDate: { uk: '1901' },
                status: 'published',
                updatedAt: '2023-01-01'
              }
            ],
            total: 9,
            page: 1,
            totalPages: 2
          }
        },
        loading: false,
        error: undefined
      });

      const { result } = renderHook(() => usePaginatedFunds(1, 8));

      expect(result.current.funds).toEqual([
        {
          id: '1',
          fundNumber: 1,
          name: 'Архів',
          descriptions: 2,
          cases: 3,
          dates: '1900-1920',
          status: BaseContentStatuses.Published,
          updatedAt: '2023-01-01'
        }
      ]);
      expect(result.current.total).toBe(9);
      expect(result.current.totalPages).toBe(2);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it('should return empty funds, zero total and zero totalPages when findFundsPaginated is missing', () => {
      mockUsePaginatedFundsQuery.mockReturnValue({ data: undefined, loading: true, error: undefined });

      const { result } = renderHook(() => usePaginatedFunds(1, 8));

      expect(result.current.funds).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.totalPages).toBe(0);
      expect(result.current.loading).toBe(true);
    });

    it('should pass page, limit and filters through as query variables with default fund-number sort', () => {
      mockUsePaginatedFundsQuery.mockReturnValue({ data: undefined, loading: false, error: undefined });
      const filters = { search: 'foo', statuses: null };

      renderHook(() => usePaginatedFunds(2, 8, filters));

      expect(mockUsePaginatedFundsQuery).toHaveBeenCalledWith({
        variables: {
          page: 2,
          limit: 8,
          filters: {
            ...filters,
            sort: [{ field: 'fundNumber', order: SortOrder.Asc }]
          }
        },
        fetchPolicy: 'network-only'
      });
    });
  });

  describe('useCreateFund', () => {
    it('should wrap the mutation with safeMutate and the create error messages', async () => {
      const mutateMock = jest.fn();
      mockUseCreateFundMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: { createFund: { id: '1' } } } as never);

      const { result } = renderHook(() => useCreateFund());
      const [createFund] = result.current;

      const input = { fundNumber: 1 } as Parameters<typeof createFund>[0];
      await createFund(input);

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        { input },
        FundErrors.NETWORK_ERROR_CREATE,
        FundErrors.FAILED_TO_CREATE
      );
    });
    it('should use fallback error messages when FundErrors are missing', async () => {
      const originalNetwork = FundErrors.NETWORK_ERROR_CREATE;
      const originalFailed = FundErrors.FAILED_TO_CREATE;

      Object.defineProperty(FundErrors, 'NETWORK_ERROR_CREATE', { value: undefined, configurable: true });
      Object.defineProperty(FundErrors, 'FAILED_TO_CREATE', { value: undefined, configurable: true });

      const mutateMock = jest.fn();
      mockUseCreateFundMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: { createFund: { id: '1' } } } as never);

      const { result } = renderHook(() => useCreateFund());
      const [createFund] = result.current;

      await createFund({
        fundNumber: 1,
        documentCreationDate: undefined,
        name: undefined
      });

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        { input: { fundNumber: 1 } },
        'Помилка мережі при створенні',
        'Не вдалося зберегти фонд'
      );

      Object.defineProperty(FundErrors, 'NETWORK_ERROR_CREATE', { value: originalNetwork, configurable: true });
      Object.defineProperty(FundErrors, 'FAILED_TO_CREATE', { value: originalFailed, configurable: true });
    });
  });

  describe('useUpdateFund', () => {
    it('should wrap the mutation with safeMutate and the update error messages', async () => {
      const mutateMock = jest.fn();
      mockUseUpdateFundMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: { updateFund: { id: '1' } } } as never);

      const { result } = renderHook(() => useUpdateFund());
      const [updateFund] = result.current;

      const variables = { id: '1', input: {} } as Parameters<typeof updateFund>[0];
      await updateFund(variables);

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        variables,
        FundErrors.NETWORK_ERROR_UPDATE,
        FundErrors.FAILED_TO_UPDATE
      );
    });
    it('should use fallback error messages when FundErrors are missing', async () => {
      const originalNetwork = FundErrors.NETWORK_ERROR_UPDATE;
      const originalFailed = FundErrors.FAILED_TO_UPDATE;

      Object.defineProperty(FundErrors, 'NETWORK_ERROR_UPDATE', { value: undefined, configurable: true });
      Object.defineProperty(FundErrors, 'FAILED_TO_UPDATE', { value: undefined, configurable: true });

      const mutateMock = jest.fn();
      mockUseUpdateFundMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: { updateFund: { id: '1' } } } as never);

      const { result } = renderHook(() => useUpdateFund());
      const [updateFund] = result.current;

      await updateFund({ id: '1', input: {} });

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        { id: '1', input: {} },
        'Помилка мережі при оновленні',
        'Не вдалося оновити фонд'
      );

      Object.defineProperty(FundErrors, 'NETWORK_ERROR_UPDATE', { value: originalNetwork, configurable: true });
      Object.defineProperty(FundErrors, 'FAILED_TO_UPDATE', { value: originalFailed, configurable: true });
    });
  });

  describe('useDeleteFund', () => {
    it('should wrap the mutation with safeMutate and the delete error messages', async () => {
      const mutateMock = jest.fn();
      mockUseDeleteFundMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: {} } as never);

      const { result } = renderHook(() => useDeleteFund());
      const [deleteFund] = result.current;

      const variables = { id: '1' } as Parameters<typeof deleteFund>[0];
      await deleteFund(variables);

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        variables,
        FundErrors.NETWORK_ERROR_DELETE,
        FundErrors.FAILED_TO_DELETE
      );
    });
    
    it('should use fallback error messages when FundErrors are missing', async () => {
      const originalNetwork = FundErrors.NETWORK_ERROR_DELETE;
      const originalFailed = FundErrors.FAILED_TO_DELETE;
  
      Object.defineProperty(FundErrors, 'NETWORK_ERROR_DELETE', { value: undefined, configurable: true });
      Object.defineProperty(FundErrors, 'FAILED_TO_DELETE', { value: undefined, configurable: true });
  
      const mutateMock = jest.fn();
      mockUseDeleteFundMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: {} } as never);
  
      const { result } = renderHook(() => useDeleteFund());
      const [deleteFund] = result.current;
  
      await deleteFund({ id: '1' });
  
      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        { id: '1' },
        'Помилка мережі при видаленні',
        'Не вдалося видалити фонд'
      );
  
      Object.defineProperty(FundErrors, 'NETWORK_ERROR_DELETE', { value: originalNetwork, configurable: true });
      Object.defineProperty(FundErrors, 'FAILED_TO_DELETE', { value: originalFailed, configurable: true });
    });
  });

  describe('useHasPublishedCasesInFund', () => {
    it('should query published cases by fund id and return true when any exist', async () => {
      mockApolloQuery.mockResolvedValue({ data: { allCases: [{ id: 'case-1' }] } });

      const { result } = renderHook(() => useHasPublishedCasesInFund());

      await expect(result.current('fund-1')).resolves.toBe(true);
      expect(mockApolloQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            filters: {
              fundId: 'fund-1',
              statuses: [BaseContentStatuses.Published]
            }
          },
          fetchPolicy: 'network-only'
        })
      );
    });

    it('should return false when there are no published cases', async () => {
      mockApolloQuery.mockResolvedValue({ data: { allCases: [] } });

      const { result } = renderHook(() => useHasPublishedCasesInFund());

      await expect(result.current('fund-1')).resolves.toBe(false);
    });
  });

  describe('useCreateCase', () => {
    it('should wrap the mutation with safeMutate and case create error messages', async () => {
      const mutateMock = jest.fn();
      mockUseCreateCaseMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: { createCase: { id: 'case-1' } } } as never);

      const { result } = renderHook(() => useCreateCase());
      const [createCase] = result.current;

      const input = { title: { uk: 'Нова справа' }, fundId: 'fund-1' } as any;
      await createCase(input);

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        { input },
        'Помилка мережі при створенні справи',
        'Не вдалося створити справу'
      );
    });
  });

  describe('useUpdateCase', () => {
    it('should wrap the mutation with safeMutate and case update error messages', async () => {
      const mutateMock = jest.fn();
      mockUseUpdateCaseMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: { updateCase: { id: 'case-1' } } } as never);

      const { result } = renderHook(() => useUpdateCase());
      const [updateCase] = result.current;

      const variables = { id: 'case-1', input: { title: { uk: 'Оновлена справа' } } } as any;
      await updateCase(variables);

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        variables,
        'Помилка мережі при оновленні справи',
        'Не вдалося оновити справу'
      );
    });
  });

  describe('useDeleteCase', () => {
    it('should wrap the mutation with safeMutate and case delete error messages', async () => {
      const mutateMock = jest.fn();
      mockUseDeleteCaseMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: { deleteCase: { success: true } } } as never);

      const { result } = renderHook(() => useDeleteCase());
      const [deleteCase] = result.current;

      const variables = { id: 'case-1' } as any;
      await deleteCase(variables);

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        variables,
        'Помилка мережі при видаленні справи',
        'Не вдалося видалити справу'
      );
    });
  });
});