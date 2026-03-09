import {BaseContentFields} from '~/domain/entities/BaseContent';
import {NewsStatus} from '~/types/enums/common.enums';

export type News = BaseContentFields & {
  id: string;
  newsDate?: Date;
  content: {
    uk: unknown;
    en: unknown;
  };
  status: NewsStatus;
};
