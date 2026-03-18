import { endpointRepositoryHandler } from '../helpers';

const endpointHandler = endpointRepositoryHandler('assetsRepository');

export const AssetsQuery = {
  allAssets: endpointHandler(async ({ args: { filters }, repo }) => repo.findAll(filters))
};
