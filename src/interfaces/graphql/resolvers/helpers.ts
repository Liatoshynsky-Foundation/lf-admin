import { GraphQLError } from 'graphql';

import {extractImagesWithMetadata} from '~/application/use-cases/extractImageSrc/extractImageSrc';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { JsonValue } from '~/back-shared/types/pages/types';
import { graphqlErrors } from '~/constants/errors';
import { LocalizedImage} from '~/domain/entities/BaseContent';
import {BaseEntity, FiltersInput} from '~/domain/repositories/baseRepository';
import {ImageCropModel} from '~/infrastructure/models/imageCrop.model';
import { RepositoriesModule } from '~/src/container/modules/repositories.module';
import {generateUniqueSlug} from '~/src/shared/utils';
import {SortByDate, SortOrder} from '~/types/enums/common.enums';

type Handler<TArgs, RepoKey extends keyof RepositoriesModule, TResult> = (params: {
  args: TArgs;
  requestContainer: GraphQLContext['requestContainer'];
  admin: GraphQLContext['admin'];
  repo: RepositoriesModule[RepoKey];
}) => Promise<TResult>;

export function endpointRepositoryHandler<RepoKey extends keyof RepositoriesModule>(repoKey: RepoKey) {
  return <TArgs, TResult>(handler: Handler<TArgs, RepoKey, TResult>) => {
    return async (_: unknown, args: TArgs, context: GraphQLContext): Promise<TResult> => {
      const { requestContainer, admin } = context;

      if (!admin) {
        throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
          extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
        });
      }

      const repo = requestContainer.cradle[repoKey];
      return handler({ args, requestContainer, admin, repo });
    };
  };
}

interface GenericFiltersInput {
  status?: string | null;
  statuses?: Array<string | null> | null;
  slug?: string | null;
  search?: string | null;
  languages?: Array<string | null> | null;
  limit?: number | null;
  skip?: number | null;
  sort?: Array<{
    field?: string | null;
    order?: string | null;
  }> | null;
}

export const mapFilters = <T extends FiltersInput>(
  filters?: GenericFiltersInput | null
): T | undefined => {
  if (!filters) return undefined;

  const statuses = [
    ...(filters.statuses?.filter((status): status is string => Boolean(status)) ?? []),
    ...(filters.status ? [filters.status] : [])
  ];

  const mapped = {
    statuses: statuses.length ? [...new Set(statuses)] : undefined,
    slug: filters.slug ?? undefined,
    search: filters.search ?? undefined,
    languages: filters.languages?.filter((language): language is string => Boolean(language)) ?? undefined,
    limit: filters.limit ?? undefined,
    skip: filters.skip ?? undefined,
    sort: filters.sort?.map(s => ({
      sortBy: s.field as SortByDate,
      sortOrder: s.order as SortOrder
    }))
  };

  return mapped as unknown as T;
};

export const extractTitleForSlug = (title: unknown): string => {
  if (typeof title === 'object' && title && 'uk' in title) {
    return (title as { uk: string }).uk;
  }
  if (typeof title === 'string') {
    return title;
  }
  return '';
};

export const processSlugUpdate = async <
    TRepo extends { findBySlug: (slug: string) => Promise<BaseEntity | null> }
>(
  id: string | null,
  title: unknown,
  repo: TRepo,
  updateData: { slug?: string }
): Promise<void> => {
  const titleForSlug = extractTitleForSlug(title);

  if (titleForSlug) {
    updateData.slug = await generateUniqueSlug(titleForSlug, {
      checkExists: async (slug: string) => {
        const existing = await repo.findBySlug(slug);
        return existing !== null && (id ? existing.id !== id : true);
      }
    });
  }
};

export const syncImagesCrops = async (
  contentId: string,
  data: unknown,
  options: {
    locale?: 'uk' | 'en';
    cropIdPrefix?: string;
    isCoverImage?: boolean;
  } = {}
): Promise<void> => {
  const { locale = 'uk', cropIdPrefix = '', isCoverImage = false } = options;

  if (!isCoverImage) {
    const imagesWithMetadata = extractImagesWithMetadata(data as JsonValue);

    for (const item of imagesWithMetadata) {
      if (item.crop) {
        await ImageCropModel.findOneAndUpdate(
          {
            pageId: contentId,
            cropId: item.src,
            locale
          },
          {
            crop: item.crop,
            pageId: contentId,
            cropId: item.src,
            locale
          },
          { upsert: true, new: true }
        );
      }
    }
    return;
  }

  if (isCoverImage) {
    const image = data as LocalizedImage;
    if (image?.crop) {
      const locales: Array<'uk' | 'en'> = ['uk', 'en'];

      await Promise.all(locales.map(l =>
        ImageCropModel.findOneAndUpdate(
          {
            pageId: contentId,
            cropId: cropIdPrefix || 'coverImage',
            locale: l
          },
          {
            crop: image.crop,
            pageId: contentId,
            cropId: cropIdPrefix || 'coverImage',
            locale: l
          },
          { upsert: true, new: true }
        )
      ));
    }
  }
};