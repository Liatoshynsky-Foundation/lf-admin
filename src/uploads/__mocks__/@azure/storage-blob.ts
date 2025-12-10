export const BlobServiceClient = jest.fn().mockImplementation(() => ({
  getContainerClient: jest.fn().mockReturnValue({
    createIfNotExists: jest.fn(),
    getBlockBlobClient: jest.fn().mockReturnValue({
      upload: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getProperties: jest.fn(),
      url: 'https://mock-blob-url.com/test'
    })
  })
}));

export const ContainerClient = jest.fn().mockImplementation(() => ({
  createIfNotExists: jest.fn(),
  getBlockBlobClient: jest.fn().mockReturnValue({
    upload: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    getProperties: jest.fn(),
    url: 'https://mock-blob-url.com/test'
  })
}));

export const BlockBlobClient = jest.fn().mockImplementation(() => ({
  upload: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  getProperties: jest.fn(),
  url: 'https://mock-blob-url.com/test'
}));

export const RestError = class RestError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode;
  }
};
