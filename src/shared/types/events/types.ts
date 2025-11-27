import { JsonValue } from '~/back-shared/types/pages/types';
import type { CoverImage, TranslatedField } from '~/domain/entities/Event';
import { EventStatus } from '~/types/enums/common.enums';

export interface CreateEventDTO {
  eventLink: string;
  title: TranslatedField;
  description?: TranslatedField;
  content: {
    uk: JsonValue;
    en: JsonValue;
  };
  slug?: string;
  coverImage: CoverImage;
  status?: EventStatus;
}

export interface UpdateEventDTO {
  eventLink?: string;
  title?: TranslatedField;
  description?: TranslatedField;
  content?: {
    uk: JsonValue;
    en: JsonValue;
  };
  slug?: string;
  coverImage?: CoverImage;
  status?: EventStatus;
}

export interface EventFilters {
  status?: EventStatus;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'visits.views';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
