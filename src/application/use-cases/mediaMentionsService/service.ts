import { createBaseService } from '../baseService/baseService';
import { MediaMentionsServiceErrors } from '~/back-constants/errors';
import { generateUniqueSlug } from '~/back-shared/utils';
import { MediaMentionEntity, MediaMentionFilters, MediaStatus } from '~/domain/entities/MediaMentions';
import { MediaMentionsRepository } from '~/domain/repositories/mediaMentionsRepository';
import { parseMediaMention } from '~/lib/parser/mediaMentionsParser';
import { isError, Result } from '~/types/common';

type MediaMentionsServiceDeps = {
  mediaMentionsRepository: MediaMentionsRepository;
};

function Unwrapper<T>(result: Result<T>): T {
  if (isError(result)) {
    throw new Error(result.error.Error());
  }

  return result.value;
}

export function newMediaMentionsService({ mediaMentionsRepository: repo }: MediaMentionsServiceDeps) {
  const baseService = createBaseService({
    repository: repo,
    entityName: 'MediaMention'
  });

  return {
    ...baseService,
    async create(mentionUrl: string): Promise<MediaMentionEntity> {
      const entity = await parseMediaMention(mentionUrl);
      if (!entity) {
        throw new Error(MediaMentionsServiceErrors.INVALID_URL.Error());
      }

      const slug = await generateUniqueSlug(entity.title, {
        checkExists: async (slug: string) => !!(await repo.findBySlug(slug))
      });

      return Unwrapper(
        await repo.create({
          ...entity,
          slug
        })
      );
    },
    async getPublishedPaginated(filters?: Omit<MediaMentionFilters, 'status'>): Promise<MediaMentionEntity[]> {
      return await repo.findAll({ ...filters, status: MediaStatus.PUBLISHED });
    },
    async publish(id: string): Promise<void> {
      return Unwrapper(await repo.publish(id));
    },
    async unpublish(id: string): Promise<void> {
      return Unwrapper(await repo.unpublish(id));
    },
    async addView(id: string): Promise<void> {
      return Unwrapper(await repo.addView(id));
    }
  };
}
