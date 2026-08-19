import { renderHook } from '@testing-library/react';

import { FundErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockUseFundByIdQuery = jest.fn();
const mockUseAllFundsQuery = jest.fn();
const mockUseCreateFundMutation = jest.fn();
const mockUseUpdateFundMutation = jest.fn();
const mockUseDeleteFundMutation = jest.fn();

jest.mock('~/types/graphql/generated/graphql', () => ({
  __esModule: true,
  useFundByIdQuery: (...args: unknown[]) => mockUseFundByIdQuery(...args),
  useAllFundsQuery: (...args: unknown[]) => mockUseAllFundsQuery(...args),
  useCreateFundMutation: (...args: unknown[]) => mockUseCreateFundMutation(...args),
  useUpdateFundMutation: (...args: unknown[]) => mockUseUpdateFundMutation(...args),
  useDeleteFundMutation: (...args: unknown[]) => mockUseDeleteFundMutation(...args)
}));

jest.mock('~/lib/utils/safeMutate', () => ({
  __esModule: true,
  safeMutate: jest.fn()
}));

import { useAllFunds, useCreateFund, useDeleteFund, useFundById, useUpdateFund } from './useFunds';

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
