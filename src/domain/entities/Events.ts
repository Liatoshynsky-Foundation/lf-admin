import { BaseContentFields, LocalizedContent } from '~/domain/entities/BaseContent';
import { EventStatus } from '~/types/enums/common.enums';

export type EventsEntity = BaseContentFields & {
  id: string;
  eventLink: string;
  content: LocalizedContent;
  status: EventStatus;
  eventDateTimeStart?: string | null;
  eventDateTimeEnd?: string | null;
  ticketUrl?: string | null;
};
