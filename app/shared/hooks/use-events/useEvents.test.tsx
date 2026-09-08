import { act,renderHook } from '@testing-library/react';

import { buildStatusUpdater } from '../buildStatusUpdater';
import {
  useAllEvents,
  useCreateEvent,
  useDeleteEvent,
  useEventById,
  useEventsCount,
  useIncrementEventViews,
  usePaginatedEvents,
  usePublishedEvents,
  useUpdateEvent,
  useUpdateEventStatus} from './useEvents';
import { EventsErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import type {
  CreateEventInput,
  DeleteEventMutationVariables,
  EventFiltersInput,
  UpdateEventMutationVariables} from '~/types/graphql/generated/graphql';
import * as graphqlHooks from '~/types/graphql/generated/graphql';

jest.mock('~/types/graphql/generated/graphql', () => ({
  AllEventsDocument: { kind: 'Document', definitions: [] },
  EventStatus: {
    Published: 'Published',
    Draft: 'Draft',
    Archived: 'Archived',
    Hidden: 'Hidden'
  },
  useEventByIdQuery: jest.fn(),
  useAllEventsQuery: jest.fn(),
  usePublishedEventsQuery: jest.fn(),
  usePaginatedEventsQuery: jest.fn(),
  useEventsCountQuery: jest.fn(),
  useCreateEventMutation: jest.fn(() => [jest.fn(), { loading: false }]),
  useUpdateEventMutation: jest.fn(() => [
    jest.fn(),
    { loading: false, data: { updateEvent: { status: 'Published' } } }
  ]),
  useDeleteEventMutation: jest.fn(() => [jest.fn(), { loading: false }]),
  useIncrementEventViewsMutation: jest.fn(() => [jest.fn(), { loading: false }])
}));

jest.mock('~/lib/utils/safeMutate', () => ({
  safeMutate: jest.fn()
}));

jest.mock('../buildStatusUpdater', () => ({
  buildStatusUpdater: jest.fn(() => jest.fn(() => jest.fn()))
}));

jest.mock('~/constants/errors', () => ({
  EventsErrors: {
    NETWORK_ERROR_CREATE: 'NETWORK_ERROR_CREATE',
    FAILED_TO_CREATE: 'FAILED_TO_CREATE',
    NETWORK_ERROR_UPDATE: 'NETWORK_ERROR_UPDATE',
    FAILED_TO_UPDATE: 'FAILED_TO_UPDATE',
    NETWORK_ERROR_DELETE: 'NETWORK_ERROR_DELETE',
    FAILED_TO_DELETE: 'FAILED_TO_DELETE'
  }
}));

describe('useEvents hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useEventById', () => {
    it('calls query with correct default options', () => {
      renderHook(() => useEventById('123'));
      expect(graphqlHooks.useEventByIdQuery).toHaveBeenCalledWith({
        variables: { id: '123' },
        fetchPolicy: 'network-only',
        skip: false
      });
    });

    it('respects skip option and empty id', () => {
      renderHook(() => useEventById('123', { skip: true }));
      expect(graphqlHooks.useEventByIdQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));

      renderHook(() => useEventById(''));
      expect(graphqlHooks.useEventByIdQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    });
  });

  describe('useAllEvents', () => {
    it('calls query with defaults when no arguments provided', () => {
      renderHook(() => useAllEvents());
      expect(graphqlHooks.useAllEventsQuery).toHaveBeenCalledWith({
        variables: { filters: undefined },
        fetchPolicy: 'network-only',
        skip: undefined
      });
    });

    it('calls query with filters and skip option', () => {
      const filters = { search: 'test' } as EventFiltersInput;
      renderHook(() => useAllEvents(filters, { skip: true }));
      expect(graphqlHooks.useAllEventsQuery).toHaveBeenCalledWith({
        variables: { filters },
        fetchPolicy: 'network-only',
        skip: true
      });
    });
  });

  describe('usePublishedEvents', () => {
    it('calls query with defaults when no arguments provided', () => {
      renderHook(() => usePublishedEvents());
      expect(graphqlHooks.usePublishedEventsQuery).toHaveBeenCalledWith({
        variables: { filters: undefined },
        fetchPolicy: 'cache-first',
        skip: undefined
      });
    });

    it('calls query with filters and options', () => {
      const filters = { search: 'test' } as EventFiltersInput;
      renderHook(() => usePublishedEvents(filters, { skip: true }));
      expect(graphqlHooks.usePublishedEventsQuery).toHaveBeenCalledWith({
        variables: { filters },
        fetchPolicy: 'cache-first',
        skip: true
      });
    });
  });

  describe('usePaginatedEvents', () => {
    it('calls query with default page and limit', () => {
      renderHook(() => usePaginatedEvents());
      expect(graphqlHooks.usePaginatedEventsQuery).toHaveBeenCalledWith({
        variables: { page: 1, limit: 10, filters: undefined },
        fetchPolicy: 'network-only'
      });
    });

    it('calls query with explicit arguments', () => {
      const filters = { search: 'test' } as EventFiltersInput;
      renderHook(() => usePaginatedEvents(2, 20, filters));
      expect(graphqlHooks.usePaginatedEventsQuery).toHaveBeenCalledWith({
        variables: { page: 2, limit: 20, filters },
        fetchPolicy: 'network-only'
      });
    });
  });

  describe('useEventsCount', () => {
    it('calls query without status', () => {
      renderHook(() => useEventsCount());
      expect(graphqlHooks.useEventsCountQuery).toHaveBeenCalledWith({
        variables: { status: undefined }
      });
    });

    it('calls query with status', () => {
      renderHook(() => useEventsCount(graphqlHooks.EventStatus.Published));
      expect(graphqlHooks.useEventsCountQuery).toHaveBeenCalledWith({
        variables: { status: graphqlHooks.EventStatus.Published }
      });
    });
  });

  describe('useCreateEvent', () => {
    it('calls safeMutate with correct parameters', async () => {
      const mockMutate = jest.fn();
      (graphqlHooks.useCreateEventMutation as jest.Mock).mockReturnValue([mockMutate, { loading: false }]);

      const { result } = renderHook(() => useCreateEvent());
      const [createEvent] = result.current;
      const input = { title: 'New Event' } as CreateEventInput;

      await act(async () => {
        await createEvent(input);
      });

      expect(safeMutate).toHaveBeenCalledWith(
        mockMutate,
        { input },
        EventsErrors.NETWORK_ERROR_CREATE,
        EventsErrors.FAILED_TO_CREATE
      );
    });
  });

  describe('useUpdateEvent', () => {
    it('calls safeMutate with correct parameters', async () => {
      const mockMutate = jest.fn();
      (graphqlHooks.useUpdateEventMutation as jest.Mock).mockReturnValue([mockMutate, { loading: false }]);

      const { result } = renderHook(() => useUpdateEvent());
      const [updateEvent] = result.current;
      const variables = { id: '1', input: {} } as UpdateEventMutationVariables;

      await act(async () => {
        await updateEvent(variables);
      });

      expect(safeMutate).toHaveBeenCalledWith(
        mockMutate,
        variables,
        EventsErrors.NETWORK_ERROR_UPDATE,
        EventsErrors.FAILED_TO_UPDATE
      );
    });
  });

  describe('useUpdateEventStatus', () => {
    it('returns correct updaters and meta data', () => {
      const mockMutate = jest.fn();
      (graphqlHooks.useUpdateEventMutation as jest.Mock).mockReturnValue([
        mockMutate,
        { loading: false, data: { updateEvent: { status: 'Published' } }, error: undefined }
      ]);

      const mockAction = jest.fn();
      const mockInnerFn = jest.fn(() => mockAction);
      (buildStatusUpdater as jest.Mock).mockReturnValue(mockInnerFn);

      const { result } = renderHook(() => useUpdateEventStatus());
      const [updaters, meta] = result.current;

      expect(meta.status).toBe('Published');
      expect(typeof updaters.publish).toBe('function');

      updaters.publish('123');

      expect(buildStatusUpdater).toHaveBeenCalledWith(mockMutate, graphqlHooks.EventStatus.Published);
      expect(mockInnerFn).toHaveBeenCalledWith(graphqlHooks.EventStatus.Published);
      expect(mockAction).toHaveBeenCalled();
    });

    it('handles undefined data safely (optional chaining test)', () => {
      (graphqlHooks.useUpdateEventMutation as jest.Mock).mockReturnValue([
        jest.fn(),
        { loading: true, data: undefined }
      ]);

      const { result } = renderHook(() => useUpdateEventStatus());
      const [, meta] = result.current;

      expect(meta.status).toBeUndefined();
    });
  });

  describe('useDeleteEvent', () => {
    it('configures delete mutation with refetchQueries and wraps with safeMutate', async () => {
      const mockMutate = jest.fn();
      (graphqlHooks.useDeleteEventMutation as jest.Mock).mockReturnValue([mockMutate, { loading: false }]);

      const { result } = renderHook(() => useDeleteEvent());
      const [deleteEvent] = result.current;
      const variables = { id: '1' } as DeleteEventMutationVariables;

      await act(async () => {
        await deleteEvent(variables);
      });

      expect(graphqlHooks.useDeleteEventMutation).toHaveBeenCalledWith({
        refetchQueries: [{ kind: 'Document', definitions: [] }],
        awaitRefetchQueries: true
      });
      expect(safeMutate).toHaveBeenCalledWith(
        mockMutate,
        variables,
        EventsErrors.NETWORK_ERROR_DELETE,
        EventsErrors.FAILED_TO_DELETE
      );
    });
  });

  describe('useIncrementEventViews', () => {
    it('calls mutate with correct id', async () => {
      const mockMutate = jest.fn();
      (graphqlHooks.useIncrementEventViewsMutation as jest.Mock).mockReturnValue([mockMutate, { loading: false }]);

      const { result } = renderHook(() => useIncrementEventViews());
      const [incrementViews] = result.current;

      await act(async () => {
        await incrementViews('1');
      });

      expect(mockMutate).toHaveBeenCalledWith({ variables: { id: '1' } });
    });
  });
});
