import { BaseEntity, BaseFilters } from '~/infrastructure/repositories/baseRepository/baseRepository';

export enum MediaStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  HIDDEN = 'HIDDEN',
  EDITING = 'EDITING'
}

export type MediaMentionEntityRaw = {
  url: string;
  title: string;
  description: string;
  slug: string;
  coverImageUrl: string;
  status: MediaStatus;
  publishedAt: Date;
  meta: {
    views: number;
  };
};

export type MediaMentionEntity = BaseEntity & MediaMentionEntityRaw;

export type MediaMentionFiltersRaw = {
  status?: MediaStatus;
  slug?: string;
};

export type MediaMentionFilters = BaseFilters & MediaMentionFiltersRaw;
