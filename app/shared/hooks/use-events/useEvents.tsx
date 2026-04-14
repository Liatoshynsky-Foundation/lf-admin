'use client';

import { useCallback } from 'react';

import { eventsErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import {
  type CreateEventInput,
  type CreateEventMutation,
  type CreateEventMutationVariables,
  type DeleteEventMutationVariables,
  EventFiltersInput,
  EventStatus,
  type UpdateEventInput,
  type UpdateEventMutation,
  type UpdateEventMutationVariables,
  useCreateEventMutation,
  useDeleteEventMutation,
  useEventsCountQuery,
  useIncrementEventViewsMutation,
  usePaginatedEventsQuery,
  useUpdateEventMutation
} from '~/types/graphql/generated/graphql';

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
        eventsErrors.NETWORK_ERROR_CREATE,
        eventsErrors.FAILED_TO_CREATE
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
        eventsErrors.NETWORK_ERROR_UPDATE,
        eventsErrors.FAILED_TO_UPDATE
      ),
    [mutate]
  );
  return [updateEvent, meta] as const;
};

export const useUpdateEventStatus = () => {
  const [mutate, { loading, data, error }] = useUpdateEventMutation();
  const status = data?.updateEvent.status;

  const makeStatusUpdater = useCallback(
    (status: EventStatus) => {
      return async (id: string, input?: { publishedAt?: string | null }) => {
        const payload: UpdateEventInput = { status };
        if (status === EventStatus.Published) {
          payload.publishedAt = input?.publishedAt ?? new Date().toISOString();
        }
        return mutate({ variables: { id, input: payload } });
      };
    },
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
      safeMutate(mutate, variables, eventsErrors.NETWORK_ERROR_DELETE, eventsErrors.FAILED_TO_DELETE),
    [mutate]
  );
  return [deleteEvent, meta] as const;
};

export const useIncrementEventViews = () => {
  const [mutate, meta] = useIncrementEventViewsMutation();
  const incrementViews = useCallback(async (id: string) => mutate({ variables: { id } }), [mutate]);
  return [incrementViews, meta] as const;
};
