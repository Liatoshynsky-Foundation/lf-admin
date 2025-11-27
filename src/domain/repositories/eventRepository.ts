import type { CreateEventDTO, EventFilters, UpdateEventDTO } from '~/back-shared/types/events/types';
import type { Event } from '~/domain/entities/Event';

export interface EventRepository {
  findAll(filters?: EventFilters): Promise<Event[]>;
  findById(id: string): Promise<Event | null>;
  findBySlug(slug: string): Promise<Event | null>;
  create(dto: CreateEventDTO): Promise<Event>;
  update(id: string, dto: UpdateEventDTO): Promise<Event>;
  delete(id: string): Promise<boolean>;
  incrementViews(id: string): Promise<void>;
}
