import { createBaseService } from '../baseService/baseService';
import { MediaMentionsRepository } from '~/domain/repositories/mediaMentionsRepository';

type MediaMentionsServiceDeps = {
  mediaMentionsRepository: MediaMentionsRepository;
};

export function newMediaMentionsService({ mediaMentionsRepository: repo }: MediaMentionsServiceDeps) {
  const baseService = createBaseService({
    repository: repo,
    entityName: 'MediaMention'
  });

  return {
    ...baseService
  };
}
