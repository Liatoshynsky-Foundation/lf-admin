import { createLocalStorage, LocalStorageOptions } from './localStorage';
import { StorageAdapter } from './types';

export interface DockerStorageOptions {
  volumePath: string;
  baseUrl?: string;
}

export const createDockerStorage = (options: DockerStorageOptions): StorageAdapter => {
  const { volumePath, baseUrl } = options;

  const localStorageOptions: LocalStorageOptions = {
    basePath: volumePath,
    baseUrl
  };

  const adapter = createLocalStorage(localStorageOptions);

  return adapter;
};
