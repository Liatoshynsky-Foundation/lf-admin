import { MediaMentionEntity, MediaMentionFilters } from '../entities/MediaMentions';
import { BaseRepository } from '~/infrastructure/repositories/baseRepository/baseRepository';
import { error } from '~/interfaces/error';

export interface MediaMentionsRepository extends BaseRepository<MediaMentionEntity, MediaMentionFilters> {
  create(url: string): Promise<MediaMentionEntity | error>;
  publish(id: string): Promise<void | error>;
  unpublish(id: string): Promise<void | error>;
  addView(id: string): Promise<void | error>;
}
