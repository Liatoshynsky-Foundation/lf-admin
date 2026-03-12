import { MediaMentionEntity, MediaMentionFilters } from '../entities/MediaMentions';
import {FiltersInput, IBaseRepository} from '~/domain/repositories/baseRepository';
import {MediaStatus} from '~/types/enums/common.enums';

export type MediaMentionFilters = FiltersInput & {
  status?: MediaStatus;
};

export type CreateMediaMentionInput = Omit<MediaMentionEntity, 'id' | 'createdAt' | 'updatedAt' | 'meta'> & {
  meta?: Partial<MediaMentionEntity['meta']>;
};

export type UpdateMediaMentionInput = Partial<Omit<MediaMentionEntity, 'id' | 'createdAt' | 'updatedAt'>>;

export interface MediaMentionsRepository extends IBaseRepository<MediaMentionEntity, MediaMentionFilters> {
  create(input: CreateMediaMentionInput): Promise<MediaMentionEntity>;
  incrementViews(id: string): Promise<number>;
}
