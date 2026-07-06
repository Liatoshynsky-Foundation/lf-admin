import { act, renderHook } from '@testing-library/react';

jest.mock('~/types/graphql/generated/graphql', () => ({
  MediaStatus: {
    Published: 'PUBLISHED',
    Draft: 'DRAFT',
    Archived: 'ARCHIVED',
    Hidden: 'HIDDEN'
  },
  useMediaMentionByIdQuery: jest.fn(),
  useAllMediaMentionsQuery: jest.fn(),
  usePublishedMediaMentionsQuery: jest.fn(),
  usePaginatedMediaMentionsQuery: jest.fn(),
  useMediaMentionsCountQuery: jest.fn(),
  useCreateMediaMentionMutation: jest.fn(),
  useUpdateMediaMentionMutation: jest.fn(),
  useDeleteMediaMentionMutation: jest.fn(),
  useAddMediaMentionViewMutation: jest.fn()
}));

import * as graphqlModule from '~/types/graphql/generated/graphql';

const mockUseMediaMentionByIdQuery = graphqlModule.useMediaMentionByIdQuery as jest.Mock;
const mockUseAllMediaMentionsQuery = graphqlModule.useAllMediaMentionsQuery as jest.Mock;
const mockUsePublishedMediaMentionsQuery = graphqlModule.usePublishedMediaMentionsQuery as jest.Mock;
const mockUsePaginatedMediaMentionsQuery = graphqlModule.usePaginatedMediaMentionsQuery as jest.Mock;
const mockUseMediaMentionsCountQuery = graphqlModule.useMediaMentionsCountQuery as jest.Mock;
const mockUseCreateMediaMentionMutation = graphqlModule.useCreateMediaMentionMutation as jest.Mock;
const mockUseUpdateMediaMentionMutation = graphqlModule.useUpdateMediaMentionMutation as jest.Mock;
const mockUseDeleteMediaMentionMutation = graphqlModule.useDeleteMediaMentionMutation as jest.Mock;
const mockUseAddMediaMentionViewMutation = graphqlModule.useAddMediaMentionViewMutation as jest.Mock;

import {
  useAddMediaMentionView,
  useAllMediaMentions,
  useCreateMediaMention,
  useDeleteMediaMention,
  useMediaMentionById,
  useMediaMentionsCount,
  usePaginatedMediaMentions,
  usePublishedMediaMentions,
  useUpdateMediaMention,
  useUpdateMediaMentionStatus
} from './useMediaMentions';

describe('useMediaMentions hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseMediaMentionByIdQuery.mockReturnValue({ data: null });
    mockUseAllMediaMentionsQuery.mockReturnValue({ data: null });
    mockUsePublishedMediaMentionsQuery.mockReturnValue({ data: null });
    mockUsePaginatedMediaMentionsQuery.mockReturnValue({ data: null });
    mockUseMediaMentionsCountQuery.mockReturnValue({ data: null });
    mockUseCreateMediaMentionMutation.mockReturnValue([jest.fn(), { loading: false }]);
    mockUseUpdateMediaMentionMutation.mockReturnValue([jest.fn(), { loading: false, data: null, error: null }]);
    mockUseDeleteMediaMentionMutation.mockReturnValue([jest.fn(), { loading: false }]);
    mockUseAddMediaMentionViewMutation.mockReturnValue([jest.fn(), { loading: false }]);
  });

  it('uses the media-mention-by-id query with network-only fetch policy', () => {
    renderHook(() => useMediaMentionById('mm-1', { skip: false }));

    expect(mockUseMediaMentionByIdQuery).toHaveBeenCalledWith({
      variables: { id: 'mm-1' },
      fetchPolicy: 'network-only',
      skip: false
    });
  });

  it('uses the all-media-mentions query with filters and skip option', () => {
    const filters = { source: 'site' } as never;
    renderHook(() => useAllMediaMentions(filters, { skip: true }));

    expect(mockUseAllMediaMentionsQuery).toHaveBeenCalledWith({
      variables: { filters },
      fetchPolicy: 'network-only',
      skip: true
    });
  });

  it('uses the published-media-mentions query with cache-first policy', () => {
    renderHook(() => usePublishedMediaMentions({ status: 'PUBLISHED' } as never, { skip: false }));

    expect(mockUsePublishedMediaMentionsQuery).toHaveBeenCalledWith({
      variables: { filters: { status: 'PUBLISHED' } },
      fetchPolicy: 'cache-first',
      skip: false
    });
  });

  it('uses the paginated and count queries', () => {
    renderHook(() => {
      usePaginatedMediaMentions(3, 7, { foo: 'bar' } as never);
      useMediaMentionsCount('PUBLISHED' as never);
    });

    expect(mockUsePaginatedMediaMentionsQuery).toHaveBeenCalledWith({
      variables: { page: 3, limit: 7, foo: 'bar' },
      fetchPolicy: 'network-only'
    });
    expect(mockUseMediaMentionsCountQuery).toHaveBeenCalledWith({
      variables: { status: 'PUBLISHED' },
      fetchPolicy: 'network-only'
    });
  });

  it('wraps create-media-mention mutation', async () => {
    const mutate = jest.fn();
    mockUseCreateMediaMentionMutation.mockReturnValue([mutate, { loading: false }]);

    const { result } = renderHook(() => useCreateMediaMention());
    const [create] = result.current;

    await act(async () => {
      await create({ title: 'New mention' } as never);
    });

    expect(mutate).toHaveBeenCalledWith({ variables: { input: { title: 'New mention' } } });
  });

  it('wraps update-media-mention mutation', async () => {
    const mutate = jest.fn();
    mockUseUpdateMediaMentionMutation.mockReturnValue([mutate, { loading: false }]);

    const { result } = renderHook(() => useUpdateMediaMention());
    const [update] = result.current;

    await act(async () => {
      await update('id-1', { title: 'Updated' } as never);
    });

    expect(mutate).toHaveBeenCalledWith({ variables: { id: 'id-1', input: { title: 'Updated' } } });
  });

  it('wraps delete-media-mention mutation', async () => {
    const mutate = jest.fn();
    mockUseDeleteMediaMentionMutation.mockReturnValue([mutate, { loading: false }]);

    const { result } = renderHook(() => useDeleteMediaMention());
    const [del] = result.current;

    await act(async () => {
      await del('id-2');
    });

    expect(mutate).toHaveBeenCalledWith({ variables: { id: 'id-2' } });
  });

  it('exposes status updaters and uses update mutation', async () => {
    const mutate = jest.fn();
    mockUseUpdateMediaMentionMutation.mockReturnValue([
      mutate,
      { loading: false, data: { updateMediaMention: { status: 'DRAFT' } }, error: null }
    ]);

    const { result } = renderHook(() => useUpdateMediaMentionStatus());

    await act(async () => {
      await result.current[0].publish('m-1');
      await result.current[0].draft('m-2');
      await result.current[0].archive('m-3');
      await result.current[0].hide('m-4');
    });

    expect(mutate).toHaveBeenCalledWith({
      variables: { id: 'm-1', input: { status: 'PUBLISHED', publishedAt: expect.any(String) } }
    });
    expect(mutate).toHaveBeenCalledWith({ variables: { id: 'm-2', input: { status: 'DRAFT' } } });
    expect(mutate).toHaveBeenCalledWith({ variables: { id: 'm-3', input: { status: 'ARCHIVED' } } });
    expect(mutate).toHaveBeenCalledWith({ variables: { id: 'm-4', input: { status: 'HIDDEN' } } });
  });

  it('wraps add-media-mention-view mutation', async () => {
    const mutate = jest.fn();
    mockUseAddMediaMentionViewMutation.mockReturnValue([mutate, { loading: false }]);

    const { result } = renderHook(() => useAddMediaMentionView());
    const [add] = result.current;

    await act(async () => {
      await add('m-10');
    });

    expect(mutate).toHaveBeenCalledWith({ variables: { id: 'm-10' } });
  });

  it('covers alternate branches for skip and id falsy/defaults', () => {
    renderHook(() => useMediaMentionById('', { skip: false }));
    expect(mockUseMediaMentionByIdQuery).toHaveBeenCalledWith({
      variables: { id: '' },
      fetchPolicy: 'network-only',
      skip: true
    });

    renderHook(() => useAllMediaMentions(undefined, { skip: false }));
    expect(mockUseAllMediaMentionsQuery).toHaveBeenCalledWith({
      variables: { filters: undefined },
      fetchPolicy: 'network-only',
      skip: false
    });

    renderHook(() => usePublishedMediaMentions(undefined, { skip: true }));
    expect(mockUsePublishedMediaMentionsQuery).toHaveBeenCalledWith({
      variables: { filters: undefined },
      fetchPolicy: 'cache-first',
      skip: true
    });

    renderHook(() => usePaginatedMediaMentions());
    expect(mockUsePaginatedMediaMentionsQuery).toHaveBeenCalledWith({
      variables: { page: 1, limit: 10 },
      fetchPolicy: 'network-only'
    });

    renderHook(() => useMediaMentionById('mm-2', { skip: true }));
    expect(mockUseMediaMentionByIdQuery).toHaveBeenCalledWith({
      variables: { id: 'mm-2' },
      fetchPolicy: 'network-only',
      skip: true
    });

    renderHook(() => useMediaMentionById('mm-3'));
    expect(mockUseMediaMentionByIdQuery).toHaveBeenCalledWith({
      variables: { id: 'mm-3' },
      fetchPolicy: 'network-only',
      skip: false
    });

    renderHook(() => useAllMediaMentions());
    expect(mockUseAllMediaMentionsQuery).toHaveBeenCalledWith({
      variables: { filters: undefined },
      fetchPolicy: 'network-only',
      skip: undefined
    });
    renderHook(() => usePublishedMediaMentions());
    expect(mockUsePublishedMediaMentionsQuery).toHaveBeenCalledWith({
      variables: { filters: undefined },
      fetchPolicy: 'cache-first',
      skip: undefined
    });
  });

  it('useUpdateMediaMentionStatus returns undefined status when data is absent', () => {
    mockUseUpdateMediaMentionMutation.mockReturnValue([jest.fn(), { loading: false, data: null, error: null }]);
    const { result } = renderHook(() => useUpdateMediaMentionStatus());
    const [, meta] = result.current;
    expect(meta.status).toBeUndefined();
  });
});
