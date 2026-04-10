import { endpointRepositoryHandler } from '../helpers';
import { SortOrder } from '~/types/enums/common.enums';
import { AssetType } from '~/types/graphql/generated/graphql';

export type AssetSortBy = 'filename' | 'createdAt' | 'updatedAt';

export interface AllAssetsArgs {
  filters: {
    type?: AssetType;
    isStarred?: boolean;
    sortBy?: AssetSortBy;
    sortOrder?: SortOrder;
    limit?: number;
    skip?: number;
  };
}

const endpointHandler = endpointRepositoryHandler('assetsRepository');

export const AssetsQuery = {
  allAssets: endpointHandler<AllAssetsArgs, unknown>(
    async ({ args: { filters }, repo }) => repo.findAll(filters)
  )
};