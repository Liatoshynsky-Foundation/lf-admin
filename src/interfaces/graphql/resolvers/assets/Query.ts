import { endpointRepositoryHandler } from '../helpers';
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

export const AssetsQuery = {
  allAssets: endpointHandler<AllAssetsArgs, unknown>(async ({ args: { filters }, repo }) => repo.findAll(filters))
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
