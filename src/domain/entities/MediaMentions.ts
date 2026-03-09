import {BaseContentFields} from '~/domain/entities/BaseContent';
import { BaseEntity, BaseFilters } from '~/infrastructure/repositories/baseRepository/baseRepository';
import {MediaStatus} from '~/types/enums/common.enums';

export type MediaMentionEntityRaw = BaseContentFields & {
  url: string;
  status: MediaStatus;
};

export type MediaMentionEntity = BaseEntity & MediaMentionEntityRaw;

export type MediaMentionFiltersRaw = {
  status?: MediaStatus;
};

export type MediaMentionFilters = BaseFilters & MediaMentionFiltersRaw;
