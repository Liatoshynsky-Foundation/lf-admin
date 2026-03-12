import {BaseContentFields} from '~/domain/entities/BaseContent';
import {BaseEntity} from '~/domain/repositories/baseRepository';
import {MediaStatus} from '~/types/enums/common.enums';

export type MediaMentionEntityRaw = BaseContentFields & {
  url: string;
  status: MediaStatus;
};

export type MediaMentionEntity = BaseEntity & MediaMentionEntityRaw;

export type MediaMentionFilters = {
  status?: MediaStatus;
};

