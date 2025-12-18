import { MediaMentionEntity, MediaMentionEntityRaw, MediaMentionFilters } from '../entities/MediaMentions';
import { BaseRepository } from '~/infrastructure/repositories/baseRepository/baseRepository';
import { Result } from '~/types/common';

export interface MediaMentionsRepository extends BaseRepository<MediaMentionEntity, MediaMentionFilters> {
  create(mention: Omit<MediaMentionEntityRaw, 'status'>): Promise<Result<MediaMentionEntity>>;
  publish(id: string): Promise<Result<void>>;
  unpublish(id: string): Promise<Result<void>>;
  addView(id: string): Promise<Result<void>>;
}
