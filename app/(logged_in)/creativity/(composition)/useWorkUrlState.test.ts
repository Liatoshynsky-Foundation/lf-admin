import { act, renderHook } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useWorkUrlState } from './useWorkUrlState';
import { COMPOSITION_MODAL_PARAM } from '~/constants/creativity';
import { createCompositionId } from '~/shared/hooks/use-upsert-opus/useUpsertOpus';
import {
  CompositionByIdQuery,
  useCompositionByIdQuery
} from '~/types/graphql/generated/graphql';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn()
}));

jest.mock('~/shared/hooks/use-upsert-opus/useUpsertOpus', () => ({
  createCompositionId: jest.fn()
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  useCompositionByIdQuery: jest.fn()
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockCreateCompositionId = createCompositionId as jest.MockedFunction<
  typeof createCompositionId
>;
const mockUseCompositionByIdQuery = useCompositionByIdQuery as jest.MockedFunction<
  typeof useCompositionByIdQuery
>;

type QueryResultType = ReturnType<typeof useCompositionByIdQuery>;

const createMockQueryResult = (
  overrides: Partial<QueryResultType> = {}
): QueryResultType =>
  ({
    data: undefined,
    loading: false,
    error: undefined,
    called: true,
    client: {} as QueryResultType['client'],
    networkStatus: 7,
    observable: {} as QueryResultType['observable'],
    variables: { id: '' },
    refetch: jest.fn(),
    fetchMore: jest.fn(),
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
    subscribeToMore: jest.fn(),
    updateQuery: jest.fn(),
    ...overrides
  }) as QueryResultType;

describe('useWorkUrlState', () => {
  const mockReplace = jest.fn<void, [string, { scroll?: boolean }?]>();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn()
    });
    mockUsePathname.mockReturnValue('/works');
    mockUseSearchParams.mockReturnValue(new URLSearchParams() as never);
    mockCreateCompositionId
      .mockReturnValueOnce('mocked-id-1')
      .mockReturnValueOnce('mocked-id-2')
      .mockReturnValue('mocked-id-default');
    mockUseCompositionByIdQuery.mockReturnValue(createMockQueryResult());
  });

  it('should return initial state when compositionId param is absent', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('') as never);

    const { result } = renderHook(() => useWorkUrlState());

    expect(result.current.compositionId).toBeNull();
    expect(result.current.compositionToEdit).toBeNull();
    expect(result.current.isCompositionLoading).toBe(false);
    expect(result.current.isEditOpen).toBe(false);
    expect(mockUseCompositionByIdQuery).toHaveBeenCalledWith({
      variables: { id: '' },
      skip: true,
      fetchPolicy: 'network-only'
    });
  });

  it('should map composition data when compositionId is present in searchParams', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`${COMPOSITION_MODAL_PARAM}=comp-123`) as never
    );

    const mockData: CompositionByIdQuery = {
      compositionById: {
        id: 'comp-123',
        name: { uk: 'Назва укр', en: 'Name eng' },
        genre: 'Симфонія',
        year: 1808,
        audios: [
          {
            name: 'Audio 1',
            url: 'http://example.com/audio1.mp3'
          }
        ],
        sheetMusic: [
          {
            name: 'Sheet 1',
            url: 'http://example.com/sheet1.pdf',
            publishDate: '2023-01-01'
          }
        ]
      }
    };

    mockUseCompositionByIdQuery.mockReturnValue(
      createMockQueryResult({
        data: mockData
      })
    );

    const { result } = renderHook(() => useWorkUrlState());

    expect(result.current.compositionId).toBe('comp-123');
    expect(result.current.isEditOpen).toBe(true);
    expect(result.current.compositionToEdit).toEqual({
      id: 'comp-123',
      name: 'Назва укр',
      genre: 'Симфонія',
      year: '1808',
      audios: [
        {
          id: 'mocked-id-1',
          name: 'Audio 1',
          fileUrl: 'http://example.com/audio1.mp3'
        }
      ],
      notes: [
        {
          id: 'mocked-id-2',
          name: 'Sheet 1',
          fileUrl: 'http://example.com/sheet1.pdf',
          publishDate: '2023-01-01'
        }
      ]
    });
  });

  it('should fallback to English name or empty string if Ukrainian name is missing', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`${COMPOSITION_MODAL_PARAM}=comp-123`) as never
    );

    const mockData: CompositionByIdQuery = {
      compositionById: {
        id: 'comp-123',
        name: { uk: null as unknown as string, en: 'English Name' },
        genre: null,
        year: null,
        audios: null,
        sheetMusic: [
          {
            name: null,
            url: null,
            publishDate: null
          }
        ]
      }
    };

    mockUseCompositionByIdQuery.mockReturnValue(
      createMockQueryResult({
        data: mockData
      })
    );

    const { result } = renderHook(() => useWorkUrlState());

    expect(result.current.compositionToEdit).toEqual({
      id: 'comp-123',
      name: 'English Name',
      genre: '',
      year: '',
      audios: [],
      notes: [
        {
          id: 'mocked-id-1',
          name: '',
          fileUrl: undefined,
          publishDate: ''
        }
      ]
    });
  });

  it('should fallback to empty string when both UK and EN names are missing', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`${COMPOSITION_MODAL_PARAM}=comp-123`) as never
    );

    const mockData: CompositionByIdQuery = {
      compositionById: {
        id: 'comp-123',
        name: { uk: null as unknown as string, en: null as unknown as string },
        genre: 'Genre',
        year: 2020,
        audios: [],
        sheetMusic: []
      }
    };

    mockUseCompositionByIdQuery.mockReturnValue(
      createMockQueryResult({
        data: mockData
      })
    );

    const { result } = renderHook(() => useWorkUrlState());

    expect(result.current.compositionToEdit?.name).toBe('');
  });

  it('should open edit composition by updating URL search params', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('filter=all') as never);

    const { result } = renderHook(() => useWorkUrlState());

    act(() => {
      result.current.openEditComposition('comp-789');
    });

    expect(mockReplace).toHaveBeenCalledWith(
      `/works?filter=all&${COMPOSITION_MODAL_PARAM}=comp-789`,
      { scroll: false }
    );
  });

  it('should close edit composition by deleting compositionId from URL search params', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`${COMPOSITION_MODAL_PARAM}=comp-789&filter=all`) as never
    );

    const { result } = renderHook(() => useWorkUrlState());

    act(() => {
      result.current.closeEditComposition();
    });

    expect(mockReplace).toHaveBeenCalledWith('/works?filter=all', { scroll: false });
  });

  it('should format URL without query string when closing edit and no other params remain', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`${COMPOSITION_MODAL_PARAM}=comp-789`) as never
    );

    const { result } = renderHook(() => useWorkUrlState());

    act(() => {
      result.current.closeEditComposition();
    });

    expect(mockReplace).toHaveBeenCalledWith('/works', { scroll: false });
  });

  it('should reflect loading state from query hook', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`${COMPOSITION_MODAL_PARAM}=comp-123`) as never
    );

    mockUseCompositionByIdQuery.mockReturnValue(
      createMockQueryResult({
        loading: true,
        networkStatus: 1
      })
    );

    const { result } = renderHook(() => useWorkUrlState());

    expect(result.current.isCompositionLoading).toBe(true);
  });
});
