import { createBaseService } from '../baseService/baseService';
import { MediaMentionsServiceErrors } from '~/back-constants/errors';
import { generateUniqueSlug } from '~/back-shared/utils';
import { MediaMentionsRepository } from '~/domain/repositories/mediaMentionsRepository';
import { newError } from '~/interfaces/error';
import { parseMediaMention } from '~/lib/parser/mediaMentionsParser';
import { WrapError } from '~/types/common';

type MediaMentionsServiceDeps = {
  mediaMentionsRepository: MediaMentionsRepository;
};

export function newMediaMentionsService({ mediaMentionsRepository: repo }: MediaMentionsServiceDeps) {
  const baseService = createBaseService({
    repository: repo,
    entityName: 'MediaMention'
  });

  return {
    ...baseService,
    async create(mentionUrl: string) {
      const entity = await parseMediaMention(mentionUrl);
      if (!entity) {
        return WrapError(MediaMentionsServiceErrors.INVALID_URL);
      }

      let slug;
      try {
        slug = await generateUniqueSlug(entity.title, {
          checkExists: async (slug: string) => !!(await repo.findBySlug(slug))
        });
      } catch (error) {
        if (error instanceof Error) {
          return WrapError(newError(`Failed to generate unique slug ${error.toString()}`));
        }
        return WrapError(newError('Failed to generate unique slug due to unknown error'));
      }

      return repo.create({
        ...entity,
        slug
      });
    },
    addView: repo.addView.bind(repo)
  };
}
