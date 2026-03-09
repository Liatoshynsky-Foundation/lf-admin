import {BaseContentFields} from '~/domain/entities/BaseContent';
import {EventStatus} from '~/types/enums/common.enums';

export type EventsEntity = BaseContentFields & {
  id: string;
  eventLink: string;
  content: {
    uk: unknown;
    en: unknown;
  };
  status: EventStatus;
};