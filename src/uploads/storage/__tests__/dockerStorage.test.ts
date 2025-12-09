import { createDockerStorage, DockerStorageOptions } from '../dockerStorage';
import { createLocalStorage } from '../localStorage';
import { StorageAdapter } from '../types';

jest.mock('../localStorage');

const mockCreateLocalStorage = createLocalStorage as jest.MockedFunction<typeof createLocalStorage>;

describe('createDockerStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create storage adapter using local storage', () => {
    const options: DockerStorageOptions = {
      volumePath: '/app/uploads'
    };

    const mockAdapter: StorageAdapter = {
      store: jest.fn(),
      retrieve: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getMetadata: jest.fn(),
      getUrl: jest.fn()
    };

    mockCreateLocalStorage.mockReturnValue(mockAdapter);

    const storage = createDockerStorage(options);

    expect(createLocalStorage).toHaveBeenCalledWith({
      basePath: '/app/uploads',
      baseUrl: undefined
    });
    expect(storage).toBe(mockAdapter);
  });

  it('should pass volumePath as basePath to local storage', () => {
    const options: DockerStorageOptions = {
      volumePath: '/custom/volume/path'
    };

    const mockAdapter: StorageAdapter = {
      store: jest.fn(),
      retrieve: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getMetadata: jest.fn(),
      getUrl: jest.fn()
    };

    mockCreateLocalStorage.mockReturnValue(mockAdapter);

    createDockerStorage(options);

    expect(createLocalStorage).toHaveBeenCalledWith({
      basePath: '/custom/volume/path',
      baseUrl: undefined
    });
  });

  it('should pass baseUrl to local storage when provided', () => {
    const options: DockerStorageOptions = {
      volumePath: '/app/uploads',
      baseUrl: 'http://localhost:3000/uploads'
    };

    const mockAdapter: StorageAdapter = {
      store: jest.fn(),
      retrieve: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getMetadata: jest.fn(),
      getUrl: jest.fn()
    };

    mockCreateLocalStorage.mockReturnValue(mockAdapter);

    createDockerStorage(options);

    expect(createLocalStorage).toHaveBeenCalledWith({
      basePath: '/app/uploads',
      baseUrl: 'http://localhost:3000/uploads'
    });
  });

  it('should return the adapter from local storage', () => {
    const options: DockerStorageOptions = {
      volumePath: '/app/uploads'
    };

    const mockAdapter: StorageAdapter = {
      store: jest.fn(),
      retrieve: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getMetadata: jest.fn(),
      getUrl: jest.fn()
    };

    mockCreateLocalStorage.mockReturnValue(mockAdapter);

    const storage = createDockerStorage(options);

    expect(storage).toHaveProperty('store');
    expect(storage).toHaveProperty('retrieve');
    expect(storage).toHaveProperty('delete');
    expect(storage).toHaveProperty('exists');
    expect(storage).toHaveProperty('getMetadata');
    expect(storage).toHaveProperty('getUrl');
  });

  it('should handle multiple docker storage instances', () => {
    const options1: DockerStorageOptions = {
      volumePath: '/app/uploads1'
    };

    const options2: DockerStorageOptions = {
      volumePath: '/app/uploads2',
      baseUrl: 'http://example.com'
    };

    const mockAdapter1: StorageAdapter = {
      store: jest.fn(),
      retrieve: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getMetadata: jest.fn(),
      getUrl: jest.fn()
    };

    const mockAdapter2: StorageAdapter = {
      store: jest.fn(),
      retrieve: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getMetadata: jest.fn(),
      getUrl: jest.fn()
    };

    mockCreateLocalStorage.mockReturnValueOnce(mockAdapter1).mockReturnValueOnce(mockAdapter2);

    const storage1 = createDockerStorage(options1);
    const storage2 = createDockerStorage(options2);

    expect(storage1).toBe(mockAdapter1);
    expect(storage2).toBe(mockAdapter2);
    expect(createLocalStorage).toHaveBeenCalledTimes(2);
  });

  it('should work with standard docker volume paths', () => {
    const standardPaths = ['/app/uploads', '/data/uploads', '/var/lib/docker/volumes/uploads'];

    const mockAdapter: StorageAdapter = {
      store: jest.fn(),
      retrieve: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getMetadata: jest.fn(),
      getUrl: jest.fn()
    };

    mockCreateLocalStorage.mockReturnValue(mockAdapter);

    standardPaths.forEach((volumePath) => {
      const options: DockerStorageOptions = { volumePath };
      createDockerStorage(options);
    });

    expect(createLocalStorage).toHaveBeenCalledTimes(standardPaths.length);
  });
});
