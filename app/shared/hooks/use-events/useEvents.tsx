'use client';

import { useCallback } from 'react';

import { buildStatusUpdater } from '../buildStatusUpdater';
import { EventsErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import {
  type CreateEventInput,
  type CreateEventMutation,
  type CreateEventMutationVariables,
  type DeleteEventMutationVariables,
  EventFiltersInput,
  EventStatus,
  type UpdateEventMutation,
  type UpdateEventMutationVariables,
  useAllEventsQuery,
  useCreateEventMutation,
  useDeleteEventMutation,
  useEventsCountQuery,
  useIncrementEventViewsMutation,
  usePaginatedEventsQuery,
  usePublishedEventsQuery,
  useUpdateEventMutation
} from '~/types/graphql/generated/graphql';

export const useAllEvents = (filters?: EventFiltersInput) =>
  useAllEventsQuery({ variables: { filters }, fetchPolicy: 'network-only' });

export const usePublishedEvents = (filters?: EventFiltersInput) =>
  usePublishedEventsQuery({ variables: { filters }, fetchPolicy: 'cache-first' });

export const usePaginatedEvents = (page = 1, limit = 10, filters?: EventFiltersInput) =>
  usePaginatedEventsQuery({ variables: { page, limit, filters }, fetchPolicy: 'network-only' });

export const useEventsCount = (status?: EventStatus) => useEventsCountQuery({ variables: { status } });

export const useCreateEvent = () => {
  const [mutate, meta] = useCreateEventMutation();
  const createEvent = useCallback(
    async (event: CreateEventInput) =>
      safeMutate<CreateEventMutation, CreateEventMutationVariables>(
        mutate,
        { input: event },
        EventsErrors.NETWORK_ERROR_CREATE,
        EventsErrors.FAILED_TO_CREATE
      ),
    [mutate]
  );
  return [createEvent, meta] as const;
};

export const useUpdateEvent = () => {
  const [mutate, meta] = useUpdateEventMutation();
  const updateEvent = useCallback(
    async (variables: UpdateEventMutationVariables) =>
      safeMutate<UpdateEventMutation, UpdateEventMutationVariables>(
        mutate,
        variables,
        EventsErrors.NETWORK_ERROR_UPDATE,
        EventsErrors.FAILED_TO_UPDATE
      ),
    [mutate]
  );
  return [updateEvent, meta] as const;
};

export const useUpdateEventStatus = () => {
  const [mutate, { loading, data, error }] = useUpdateEventMutation();
  const status = data?.updateEvent.status;

  const makeStatusUpdater = useCallback(
    (status: EventStatus) => buildStatusUpdater(mutate, EventStatus.Published)(status),
    [mutate]
  );

  return [
    {
      publish: makeStatusUpdater(EventStatus.Published),
      unpublish: makeStatusUpdater(EventStatus.Draft),
      archive: makeStatusUpdater(EventStatus.Archived),
      hide: makeStatusUpdater(EventStatus.Hidden)
    },
    { status, loading, error }
  ] as const;
};

export const useDeleteEvent = () => {
  const [mutate, meta] = useDeleteEventMutation();
  const deleteEvent = useCallback(
    async (variables: DeleteEventMutationVariables) =>
      safeMutate(mutate, variables, EventsErrors.NETWORK_ERROR_DELETE, EventsErrors.FAILED_TO_DELETE),
    [mutate]
  );
  return [deleteEvent, meta] as const;
};

export const useIncrementEventViews = () => {
  const [mutate, meta] = useIncrementEventViewsMutation();
  const incrementViews = useCallback(async (id: string) => mutate({ variables: { id } }), [mutate]);
  return [incrementViews, meta] as const;
};
