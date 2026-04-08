import { GraphQLError } from 'graphql';
import {Types} from 'mongoose';

import type { GraphQLContext } from '~/back-shared/types/container/types';
import { graphqlErrors } from '~/constants/errors';
import {LocalizedContent, LocalizedImage} from '~/domain/entities/BaseContent';
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
  slug?: string | null;
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

  const mapped = {
    status: filters.status ?? undefined,
    slug: filters.slug ?? undefined,
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

export const syncCoverImageCrop = async (
  contentId: string,
  image: LocalizedImage,
  locale: 'uk' | 'en' = 'uk'
): Promise<void> => {
  if (image.crop) {
    await ImageCropModel.findOneAndUpdate(
      {
        pageId: contentId,
        cropId: 'coverImage',
        locale
      },
      {
        crop: image.crop,
        imageAssetId: new Types.ObjectId(),
        pageId: contentId,
        cropId: 'coverImage',
        locale
      },
      { upsert: true }
    );
  }
};

export const syncContentImagesCrops = async (
  contentId: string,
  content: LocalizedContent,
  blockPrefix: string = 'content'
): Promise<void> => {
  const locales: (keyof LocalizedContent)[] = ['uk', 'en'];

  for (const locale of locales) {
    const data = content[locale];
    if (!data || typeof data !== 'object') continue;

    const findAndSync = async (obj: Record<string, unknown>, path: string = ''): Promise<void> => {
      const potentialImage = obj as unknown as LocalizedImage;

      if (potentialImage.src && potentialImage.crop) {
        await ImageCropModel.findOneAndUpdate(
          {
            pageId: contentId,
            blockId: `${blockPrefix}${path}`,
            locale
          },
          {
            crop: potentialImage.crop,
            imageAssetId: new Types.ObjectId(),
            pageId: contentId,
            blockId: `${blockPrefix}${path}`,
            locale
          },
          { upsert: true }
        );
      }

      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object') {
          await findAndSync(value as Record<string, unknown>, `${path}.${key}`);
        }
      }
    };

    await findAndSync(data as Record<string, unknown>);
  }
};