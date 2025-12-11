import type { CreateEventServiceInput, UpdateEventServiceInput } from './eventService';
import { EventStatus } from '~/back-shared/types/enums/common.enums';
import type { Event } from '~/domain/entities/Event';

export const baseEvent: Event = {
  id: '507f1f77bcf86cd799439011',
  eventDate: new Date('2025-01-01'),
  eventLink: 'https://example.com/event',
  title: {
    uk: 'Тестова подія',
    en: 'Test event'
  },
  description: {
    uk: 'Опис події',
    en: 'Event description'
  },
  content: {
    uk: { blocks: [] } as any,
    en: { blocks: [] } as any
  },
  slug: 'test-event',
  coverImage: {
    src: 'test-image.jpg',
    alt: { uk: 'Альт', en: 'Alt' },
    caption: { uk: 'Підпис', en: 'Caption' },
    isTmp: false
  },
  status: EventStatus.Published,
  visits: {
    views: 0
  },
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01')
};

export const makeCreateEventInput = (overrides: Partial<CreateEventServiceInput> = {}): CreateEventServiceInput => ({
  eventDate: null,
  eventLink: 'https://example.com/event',
  title: baseEvent.title,
  description: baseEvent.description,
  content: baseEvent.content,
  coverImage: {
    ...baseEvent.coverImage,
    src: 'tmp/test-image.jpg',
    isTmp: true
  },
  status: undefined,
  ...overrides
});

export const makeUpdateEventInput = (overrides: Partial<UpdateEventServiceInput> = {}): UpdateEventServiceInput => ({
  ...overrides
});
