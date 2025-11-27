import { JsonValue } from '~/back-shared/types/pages/types';
import { EventStatus } from '~/types/enums/common.enums';

export interface TranslatedField {
  uk: string;
  en: string;
}

export interface CoverImage {
  src: string;
  alt: TranslatedField;
  caption: TranslatedField;
  isTmp?: boolean;
}

export interface Event {
  id: string;
  eventLink: string;
  title: TranslatedField;
  description?: TranslatedField;
  content: {
    uk: JsonValue;
    en: JsonValue;
  };
  slug: string;
  coverImage: CoverImage;
  status: EventStatus;
  visits: {
    views: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
