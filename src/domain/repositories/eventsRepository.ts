import { EventsEntity } from '~/domain/entities/Events';
import {FiltersInput, IBaseRepository} from '~/domain/repositories/baseRepository';
import { EventStatus } from '~/types/enums/common.enums';

export type EventFilters = FiltersInput & {
    status?: EventStatus;
};

export type CreateEventInput = Omit<EventsEntity, 'id' | 'createdAt' | 'updatedAt' | 'meta'> & {
    meta?: Partial<EventsEntity['meta']>;
};

export type UpdateEventInput = Partial<CreateEventInput> & {
    meta?: { views: number };
    slug?: string;
};

export type IEventsRepository = IBaseRepository<EventsEntity, EventFilters> & {
    create(input: CreateEventInput): Promise<EventsEntity>;
    incrementViews(id: string): Promise<EventsEntity | null>;
};