import { ImageBlock, LocalizedString } from '~/back-shared/types/common';
import { EventStatus } from '~/back-shared/types/enums/common.enums';
import { JsonValue } from '~/back-shared/types/pages/types';

export type CreateEventDTO = {
  eventDate?: Date | null;
  eventLink: string;
  title: LocalizedString;
  description?: LocalizedString;
  content: {
    uk: JsonValue;
    en: JsonValue;
  };
  slug?: string;
  coverImage: ImageBlock;
  status?: EventStatus;
};

export type UpdateEventDTO = Partial<CreateEventDTO>;

export type EventFilters = {
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: EventStatus;
  slug?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
};
