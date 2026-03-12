import {BaseContentFields, LocalizedContent} from '~/domain/entities/BaseContent';
import {NewsStatus} from '~/types/enums/common.enums';

export type News = BaseContentFields & {
  id: string;
  newsDate?: string;
  content: LocalizedContent;
  status: NewsStatus;
};
