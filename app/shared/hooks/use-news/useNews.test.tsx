import { act, renderHook } from '@testing-library/react';

import { newsErrors } from '~/constants/errors';

jest.mock('~/types/graphql/generated/graphql', () => ({
  AllNewsDocument: { kind: 'Document', definitions: [] },
  NewsStatus: {
    Published: 'PUBLISHED',
    Draft: 'DRAFT',
    Archived: 'ARCHIVED',
    Hidden: 'HIDDEN'
  },
  useNewsByIdQuery: jest.fn(),
  useAllNewsQuery: jest.fn(),
  usePublishedNewsQuery: jest.fn(),
  usePaginatedNewsQuery: jest.fn(),
  useNewsCountQuery: jest.fn(),
  useCreateNewsMutation: jest.fn(),
  useUpdateNewsMutation: jest.fn(),
  useDeleteNewsMutation: jest.fn(),
  useIncrementNewsViewsMutation: jest.fn()
}));

jest.mock('~/lib/utils/safeMutate', () => ({
  safeMutate: jest.fn()
}));

import { safeMutate } from '~/lib/utils/safeMutate';
import * as graphqlModule from '~/types/graphql/generated/graphql';

const mockUseNewsByIdQuery = graphqlModule.useNewsByIdQuery as jest.Mock;
const mockUseAllNewsQuery = graphqlModule.useAllNewsQuery as jest.Mock;
const mockUsePublishedNewsQuery = graphqlModule.usePublishedNewsQuery as jest.Mock;
const mockUsePaginatedNewsQuery = graphqlModule.usePaginatedNewsQuery as jest.Mock;
const mockUseNewsCountQuery = graphqlModule.useNewsCountQuery as jest.Mock;
const mockUseCreateNewsMutation = graphqlModule.useCreateNewsMutation as jest.Mock;
const mockUseUpdateNewsMutation = graphqlModule.useUpdateNewsMutation as jest.Mock;
const mockUseDeleteNewsMutation = graphqlModule.useDeleteNewsMutation as jest.Mock;
const mockUseIncrementNewsViewsMutation = graphqlModule.useIncrementNewsViewsMutation as jest.Mock;
const mockSafeMutate = safeMutate as jest.Mock;

import {
  useAllNews,
  useCreateNews,
  useDeleteNews,
  useIncrementNewsViews,
  useNewsById,
  useNewsCount,
  usePaginatedNews,
  usePublishedNews,
  useUpdateNews,
  useUpdateNewsStatus
} from './useNews';

describe('useNews hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseNewsByIdQuery.mockReturnValue({ data: null });
    mockUseAllNewsQuery.mockReturnValue({ data: null });
    mockUsePublishedNewsQuery.mockReturnValue({ data: null });
    mockUsePaginatedNewsQuery.mockReturnValue({ data: null });
    mockUseNewsCountQuery.mockReturnValue({ data: null });
    mockUseCreateNewsMutation.mockReturnValue([jest.fn(), { loading: false }]);
    mockUseUpdateNewsMutation.mockReturnValue([jest.fn(), { loading: false, data: null, error: null }]);
    mockUseDeleteNewsMutation.mockReturnValue([jest.fn(), { loading: false }]);
    mockUseIncrementNewsViewsMutation.mockReturnValue([jest.fn(), { loading: false }]);
    mockSafeMutate.mockResolvedValue({ success: true });
  });

  it('uses the news-by-id query with network-only fetch policy', () => {
    renderHook(() => useNewsById('news-1', { skip: false }));

    expect(mockUseNewsByIdQuery).toHaveBeenCalledWith({
      variables: { id: 'news-1' },
      fetchPolicy: 'network-only',
      skip: false
    });
  });

  it('uses the all-news query with filters and skip option', () => {
    const filters = { status: 'DRAFT' } as never;

    renderHook(() => useAllNews(filters, { skip: true }));

    expect(mockUseAllNewsQuery).toHaveBeenCalledWith({
      variables: { filters },
      fetchPolicy: 'network-only',
      skip: true
    });
  });

  it('uses the published-news query with cache-first policy', () => {
    renderHook(() => usePublishedNews({ status: 'PUBLISHED' } as never, { skip: false }));

    expect(mockUsePublishedNewsQuery).toHaveBeenCalledWith({
      variables: { filters: { status: 'PUBLISHED' } },
      fetchPolicy: 'cache-first',
      skip: false
    });
  });

  it('uses the paginated and count news queries', () => {
    renderHook(() => {
      usePaginatedNews(2, 5, { status: 'DRAFT' } as never);
      useNewsCount('PUBLISHED' as never);
    });

    expect(mockUsePaginatedNewsQuery).toHaveBeenCalledWith({
      variables: { page: 2, limit: 5, filters: { status: 'DRAFT' } },
      fetchPolicy: 'network-only'
    });

    expect(mockUseNewsCountQuery).toHaveBeenCalledWith({ variables: { status: 'PUBLISHED' } });
  });

  it('wraps create-news mutation with safeMutate', async () => {
    const mutate = jest.fn();
    mockUseCreateNewsMutation.mockReturnValue([mutate, { loading: false }]);

    const { result } = renderHook(() => useCreateNews());
    const [createNews] = result.current;

    await act(async () => {
      await createNews({ title: 'Test news' } as never);
    });

    expect(mockSafeMutate).toHaveBeenCalledWith(
      mutate,
      { input: { title: 'Test news' } },
      newsErrors.NETWORK_ERROR_CREATE,
      newsErrors.FAILED_TO_CREATE
    );
  });

  it('wraps update-news mutation with safeMutate', async () => {
    const mutate = jest.fn();
    mockUseUpdateNewsMutation.mockReturnValue([mutate, { loading: false }]);

    const { result } = renderHook(() => useUpdateNews());
    const [updateNews] = result.current;

    await act(async () => {
      await updateNews({ id: 'news-1' } as never);
    });

    expect(mockSafeMutate).toHaveBeenCalledWith(
      mutate,
      { id: 'news-1' },
      newsErrors.NETWORK_ERROR_UPDATE,
      newsErrors.FAILED_TO_UPDATE
    );
  });

  it('exposes status updater helpers and uses the update mutation', async () => {
    const mutate = jest.fn();
    mockUseUpdateNewsMutation.mockReturnValue([
      mutate,
      { loading: false, data: { updateNews: { status: 'DRAFT' } }, error: null }
    ]);

    const { result } = renderHook(() => useUpdateNewsStatus());

    await act(async () => {
      await result.current[0].publish('news-1');
      await result.current[0].unpublish('news-2');
      await result.current[0].archive('news-3');
      await result.current[0].hide('news-4');
    });

    expect(mutate).toHaveBeenCalledWith({
      variables: {
        id: 'news-1',
        input: {
          status: 'PUBLISHED',
          publishedAt: expect.any(String)
        }
      }
    });

    expect(mutate).toHaveBeenCalledWith({ variables: { id: 'news-2', input: { status: 'DRAFT' } } });
    expect(mutate).toHaveBeenCalledWith({ variables: { id: 'news-3', input: { status: 'ARCHIVED' } } });
    expect(mutate).toHaveBeenCalledWith({ variables: { id: 'news-4', input: { status: 'HIDDEN' } } });
  });

  it('wraps delete-news mutation with safeMutate', async () => {
    const mutate = jest.fn();
    mockUseDeleteNewsMutation.mockReturnValue([mutate, { loading: false }]);

    const { result } = renderHook(() => useDeleteNews());
    const [deleteNews] = result.current;

    await act(async () => {
      await deleteNews({ id: 'news-1' } as never);
    });

    expect(mockSafeMutate).toHaveBeenCalledWith(
      mutate,
      { id: 'news-1' },
      newsErrors.NETWORK_ERROR_DELETE,
      newsErrors.FAILED_TO_DELETE,
      {
        refetchQueries: [{ kind: 'Document', definitions: [] }],
        awaitRefetchQueries: true
      }
    );
  });

  it('wraps increment views mutation', async () => {
    const mutate = jest.fn();
    mockUseIncrementNewsViewsMutation.mockReturnValue([mutate, { loading: false }]);

    const { result } = renderHook(() => useIncrementNewsViews());
    const [incrementViews] = result.current;

    await act(async () => {
      await incrementViews('news-1');
    });

    expect(mutate).toHaveBeenCalledWith({ variables: { id: 'news-1' } });
  });

  it('covers alternate branches for skip and id falsy/defaults', () => {
    renderHook(() => useNewsById('', { skip: false }));
    expect(mockUseNewsByIdQuery).toHaveBeenCalledWith({
      variables: { id: '' },
      fetchPolicy: 'network-only',
      skip: true
    });

    renderHook(() => useAllNews(undefined, { skip: false }));
    expect(mockUseAllNewsQuery).toHaveBeenCalledWith({
      variables: { filters: undefined },
      fetchPolicy: 'network-only',
      skip: false
    });

    renderHook(() => usePublishedNews(undefined, { skip: true }));
    expect(mockUsePublishedNewsQuery).toHaveBeenCalledWith({
      variables: { filters: undefined },
      fetchPolicy: 'cache-first',
      skip: true
    });

    renderHook(() => usePaginatedNews());
    expect(mockUsePaginatedNewsQuery).toHaveBeenCalledWith({
      variables: { page: 1, limit: 10, filters: undefined },
      fetchPolicy: 'network-only'
    });

    renderHook(() => useNewsById('news-2', { skip: true }));
    expect(mockUseNewsByIdQuery).toHaveBeenCalledWith({
      variables: { id: 'news-2' },
      fetchPolicy: 'network-only',
      skip: true
    });
  });

  it('useNewsById with truthy id and skip false yields skip false', () => {
    renderHook(() => useNewsById('news-3', { skip: false }));
    expect(mockUseNewsByIdQuery).toHaveBeenCalledWith({
      variables: { id: 'news-3' },
      fetchPolicy: 'network-only',
      skip: false
    });
  });

  it('useUpdateNewsStatus returns undefined status when data is absent', () => {
    const { result } = renderHook(() => useUpdateNewsStatus());
    const [, meta] = result.current;
    expect(meta.status).toBeUndefined();
  });
  it('useAllNews and usePublishedNews default skip undefined', () => {
    renderHook(() => useAllNews());
    expect(mockUseAllNewsQuery).toHaveBeenCalledWith({
      variables: { filters: undefined },
      fetchPolicy: 'network-only',
      skip: undefined
    });

    renderHook(() => usePublishedNews());
    expect(mockUsePublishedNewsQuery).toHaveBeenCalledWith({
      variables: { filters: undefined },
      fetchPolicy: 'cache-first',
      skip: undefined
    });
  });

  it('useNewsById default options with truthy id yields skip false', () => {
    renderHook(() => useNewsById('news-4'));
    expect(mockUseNewsByIdQuery).toHaveBeenCalledWith({
      variables: { id: 'news-4' },
      fetchPolicy: 'network-only',
      skip: false
    });
  });
});
