import { endpointRepositoryHandler } from '../helpers';
import type { ICompositionRepository } from '~/src/domain/repositories/compositionRepository';
import type { AssetEntity } from '~/src/infrastructure/repositories/assetRepository/assetRepository';
import { SortOrder } from '~/types/enums/common.enums';
import { AssetType } from '~/types/graphql/generated/graphql';

export type AssetSortBy = 'filename' | 'createdAt' | 'updatedAt';

export interface AllAssetsArgs {
  filters: {
    type?: AssetType;
    isStarred?: boolean;
    isUsed?: boolean;
    sortBy?: AssetSortBy;
    sortOrder?: SortOrder;
    limit?: number;
    skip?: number;
  };
}
export interface UpdateAssetArgs {
  id: string;
  input: {
    isStarred?: boolean;
    filename?: string;
    description?: string;
  };
}
export interface CreateAssetArgs {
  input: {
    filename: string;
    originalname?: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
    type: AssetType;
    description?: string;
  };
}
export interface DeleteAssetArgs {
  id: string;
}

const endpointHandler = endpointRepositoryHandler('assetsRepository');
const OBJECT_ID = /^[a-f\d]{24}$/i;

type AssetUsageRef = AssetEntity['usageRefs'][number];
type AssetWithCompositionNames = Omit<AssetEntity, 'usageRefs'> & {
  usageRefs: Array<AssetUsageRef & { compositionName?: string }>;
};

const getCompositionId = (ref: AssetUsageRef): string | undefined =>
  ref.compositionId ?? (ref.pageId && OBJECT_ID.test(ref.pageId) ? ref.pageId : undefined);

const enrichAssetUsageRefs = async (
  assets: AssetEntity[],
  compositionsRepository: ICompositionRepository
): Promise<AssetWithCompositionNames[]> => {
  const compositionIds = [
    ...new Set(
      assets.flatMap((asset) =>
        asset.usageRefs.flatMap((ref) => {
          const id = getCompositionId(ref);
          return id ? [id] : [];
        })
      )
    )
  ];

  if (compositionIds.length === 0) {
    return assets;
  }

  const compositions = await compositionsRepository.findByIds(compositionIds);
  const namesById = new Map(
    compositions.map((composition) => [
      composition.id,
      composition.name.uk || composition.name.en || composition.id
    ])
  );

  return assets.map((asset) => ({
    ...asset,
    usageRefs: asset.usageRefs.map((ref) => {
      const compositionId = getCompositionId(ref);

      return compositionId
        ? { ...ref, compositionName: namesById.get(compositionId) }
        : ref;
    })
  }));
};

export const AssetsQuery = {
  allAssets: endpointHandler<AllAssetsArgs, unknown>(async ({ args: { filters }, repo, requestContainer }) => {
    const assets = await repo.findAll(filters);

    return enrichAssetUsageRefs(assets, requestContainer.cradle.compositionsRepository);
  })
};

export const AssetsMutation = {
  updateAsset: endpointHandler<UpdateAssetArgs, unknown>(async ({ args: { id, input }, repo }) => {
    return repo.updateAsset(id, input);
  }),
  createAsset: endpointHandler<CreateAssetArgs, unknown>(async ({ args: { input }, repo }) => {
    return repo.createAsset(input);
  }),
  deleteAsset: endpointHandler<DeleteAssetArgs, unknown>(async ({ args: { id }, repo }) => {
    return repo.deleteAsset(id);
  })
};
