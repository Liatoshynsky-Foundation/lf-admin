import { renderHook } from '@testing-library/react';

import { FondErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockUseFondByIdQuery = jest.fn();
const mockUseAllFondsQuery = jest.fn();
const mockUseCreateFondMutation = jest.fn();
const mockUseUpdateFondMutation = jest.fn();
const mockUseDeleteFondMutation = jest.fn();

jest.mock('~/types/graphql/generated/graphql', () => ({
  __esModule: true,
  useFondByIdQuery: (...args: unknown[]) => mockUseFondByIdQuery(...args),
  useAllFondsQuery: (...args: unknown[]) => mockUseAllFondsQuery(...args),
  useCreateFondMutation: (...args: unknown[]) => mockUseCreateFondMutation(...args),
  useUpdateFondMutation: (...args: unknown[]) => mockUseUpdateFondMutation(...args),
  useDeleteFondMutation: (...args: unknown[]) => mockUseDeleteFondMutation(...args)
}));

jest.mock('~/lib/utils/safeMutate', () => ({
  __esModule: true,
  safeMutate: jest.fn()
}));

import { useAllFonds, useCreateFond, useDeleteFond, useFondById, useUpdateFond } from './useFonds';

const mockedSafeMutate = safeMutate as jest.MockedFunction<typeof safeMutate>;

describe('useFonds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useFondById', () => {
    it('should query with the given id, network-only policy, and skip when id is empty', () => {
      mockUseFondByIdQuery.mockReturnValue({ data: undefined });

      renderHook(() => useFondById('', {}));

      expect(mockUseFondByIdQuery).toHaveBeenCalledWith({
        variables: { id: '' },
        fetchPolicy: 'network-only',
        skip: true
      });
    });

    it('should not skip when an id is present and skip option is not set', () => {
      mockUseFondByIdQuery.mockReturnValue({ data: undefined });

      renderHook(() => useFondById('abc'));

      expect(mockUseFondByIdQuery).toHaveBeenCalledWith({
        variables: { id: 'abc' },
        fetchPolicy: 'network-only',
        skip: false
      });
    });

    it('should skip when explicitly requested, even with a valid id', () => {
      mockUseFondByIdQuery.mockReturnValue({ data: undefined });

      renderHook(() => useFondById('abc', { skip: true }));

      expect(mockUseFondByIdQuery).toHaveBeenCalledWith({
        variables: { id: 'abc' },
        fetchPolicy: 'network-only',
        skip: true
      });
    });
  });

  describe('useAllFonds', () => {
    it('should map findAllFonds entries, preferring chronologicalBoundaries over documentCreationDate', () => {
      mockUseAllFondsQuery.mockReturnValue({
        data: {
          findAllFonds: [
            {
              id: '1',
              fondNumber: 1,
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

      const { result } = renderHook(() => useAllFonds());

      expect(result.current.fonds).toEqual([
        {
          id: '1',
          fondNumber: 1,
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
      mockUseAllFondsQuery.mockReturnValue({
        data: {
          findAllFonds: [
            {
              id: '1',
              fondNumber: 1,
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

      const { result } = renderHook(() => useAllFonds());

      expect(result.current.fonds[0].dates).toBe('1901');
    });

    it('should default unrecognised statuses to Hidden', () => {
      mockUseAllFondsQuery.mockReturnValue({
        data: {
          findAllFonds: [
            {
              id: '1',
              fondNumber: 1,
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

      const { result } = renderHook(() => useAllFonds());

      expect(result.current.fonds[0].status).toBe(BaseContentStatuses.Hidden);
    });

    it('should return an empty array when findAllFonds is missing', () => {
      mockUseAllFondsQuery.mockReturnValue({ data: undefined, loading: true, error: undefined });

      const { result } = renderHook(() => useAllFonds());

      expect(result.current.fonds).toEqual([]);
      expect(result.current.loading).toBe(true);
    });

    it('should pass filters through as query variables', () => {
      mockUseAllFondsQuery.mockReturnValue({ data: undefined, loading: false, error: undefined });
      const filters = { search: 'foo', statuses: null };

      renderHook(() => useAllFonds(filters));

      expect(mockUseAllFondsQuery).toHaveBeenCalledWith({
        variables: { filters },
        fetchPolicy: 'network-only'
      });
    });
  });

  describe('useCreateFond', () => {
    it('should wrap the mutation with safeMutate and the create error messages', async () => {
      const mutateMock = jest.fn();
      mockUseCreateFondMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: { createFond: { id: '1' } } } as never);

      const { result } = renderHook(() => useCreateFond());
      const [createFond] = result.current;

      const input = { fondNumber: 1 } as Parameters<typeof createFond>[0];
      await createFond(input);

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        { input },
        FondErrors.NETWORK_ERROR_CREATE,
        FondErrors.FAILED_TO_CREATE
      );
    });
    it('should use fallback error messages when FondErrors are missing', async () => {
      const originalNetwork = FondErrors.NETWORK_ERROR_CREATE;
      const originalFailed = FondErrors.FAILED_TO_CREATE;

      Object.defineProperty(FondErrors, 'NETWORK_ERROR_CREATE', { value: undefined, configurable: true });
      Object.defineProperty(FondErrors, 'FAILED_TO_CREATE', { value: undefined, configurable: true });

      const mutateMock = jest.fn();
      mockUseCreateFondMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: { createFond: { id: '1' } } } as never);

      const { result } = renderHook(() => useCreateFond());
      const [createFond] = result.current;

      await createFond({
        fondNumber: 1,
        documentCreationDate: undefined,
        name: undefined
      });

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        { input: { fondNumber: 1 } },
        'Помилка мережі при створенні',
        'Не вдалося зберегти фонд'
      );

      Object.defineProperty(FondErrors, 'NETWORK_ERROR_CREATE', { value: originalNetwork, configurable: true });
      Object.defineProperty(FondErrors, 'FAILED_TO_CREATE', { value: originalFailed, configurable: true });
    });
  });

  describe('useUpdateFond', () => {
    it('should wrap the mutation with safeMutate and the update error messages', async () => {
      const mutateMock = jest.fn();
      mockUseUpdateFondMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: { updateFond: { id: '1' } } } as never);

      const { result } = renderHook(() => useUpdateFond());
      const [updateFond] = result.current;

      const variables = { id: '1', input: {} } as Parameters<typeof updateFond>[0];
      await updateFond(variables);

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        variables,
        FondErrors.NETWORK_ERROR_UPDATE,
        FondErrors.FAILED_TO_UPDATE
      );
    });
    it('should use fallback error messages when FondErrors are missing', async () => {
      const originalNetwork = FondErrors.NETWORK_ERROR_UPDATE;
      const originalFailed = FondErrors.FAILED_TO_UPDATE;

      Object.defineProperty(FondErrors, 'NETWORK_ERROR_UPDATE', { value: undefined, configurable: true });
      Object.defineProperty(FondErrors, 'FAILED_TO_UPDATE', { value: undefined, configurable: true });

      const mutateMock = jest.fn();
      mockUseUpdateFondMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: { updateFond: { id: '1' } } } as never);

      const { result } = renderHook(() => useUpdateFond());
      const [updateFond] = result.current;

      await updateFond({ id: '1', input: {} });

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        { id: '1', input: {} },
        'Помилка мережі при оновленні',
        'Не вдалося оновити фонд'
      );

      Object.defineProperty(FondErrors, 'NETWORK_ERROR_UPDATE', { value: originalNetwork, configurable: true });
      Object.defineProperty(FondErrors, 'FAILED_TO_UPDATE', { value: originalFailed, configurable: true });
    });
  });

  describe('useDeleteFond', () => {
    it('should wrap the mutation with safeMutate and the delete error messages', async () => {
      const mutateMock = jest.fn();
      mockUseDeleteFondMutation.mockReturnValue([mutateMock, { loading: false }]);
      mockedSafeMutate.mockResolvedValue({ data: {} } as never);

      const { result } = renderHook(() => useDeleteFond());
      const [deleteFond] = result.current;

      const variables = { id: '1' } as Parameters<typeof deleteFond>[0];
      await deleteFond(variables);

      expect(mockedSafeMutate).toHaveBeenCalledWith(
        mutateMock,
        variables,
        FondErrors.NETWORK_ERROR_DELETE,
        FondErrors.FAILED_TO_DELETE
      );
    });
  });
  it('should use fallback error messages when FondErrors are missing', async () => {
    const originalNetwork = FondErrors.NETWORK_ERROR_DELETE;
    const originalFailed = FondErrors.FAILED_TO_DELETE;

    Object.defineProperty(FondErrors, 'NETWORK_ERROR_DELETE', { value: undefined, configurable: true });
    Object.defineProperty(FondErrors, 'FAILED_TO_DELETE', { value: undefined, configurable: true });

    const mutateMock = jest.fn();
    mockUseDeleteFondMutation.mockReturnValue([mutateMock, { loading: false }]);
    mockedSafeMutate.mockResolvedValue({ data: {} } as never);

    const { result } = renderHook(() => useDeleteFond());
    const [deleteFond] = result.current;

    await deleteFond({ id: '1' });

    expect(mockedSafeMutate).toHaveBeenCalledWith(
      mutateMock,
      { id: '1' },
      'Помилка мережі при видаленні',
      'Не вдалося видалити фонд'
    );

    Object.defineProperty(FondErrors, 'NETWORK_ERROR_DELETE', { value: originalNetwork, configurable: true });
    Object.defineProperty(FondErrors, 'FAILED_TO_DELETE', { value: originalFailed, configurable: true });
  });
});
