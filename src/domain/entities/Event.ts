import { ImageBlock, LocalizedString } from '~/back-shared/types/common';
import { EventStatus } from '~/back-shared/types/enums/common.enums';
import { JsonValue } from '~/back-shared/types/pages/types';
import type { BaseEntity } from '~/infrastructure/repositories/baseRepository/baseRepository';

export interface Event extends BaseEntity {
  eventDate: Date | null;
  eventLink: string;
  title: LocalizedString;
  description?: LocalizedString;
  content: {
    uk: JsonValue;
    en: JsonValue;
  };
  slug: string;
  coverImage: ImageBlock;
  status: EventStatus;
  visits: {
    views: number;
  };
}
