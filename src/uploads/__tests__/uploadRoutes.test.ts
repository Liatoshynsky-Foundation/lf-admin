import type { UploadController } from '../uploadController';

const mockRouter = {
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn()
};

const mockSingle = jest.fn();
const mockArray = jest.fn();
const mockMemoryStorage = jest.fn(() => 'memory-storage');

jest.mock(
  'express',
  () => ({
    __esModule: true,
    Router: jest.fn(() => mockRouter)
  }),
  { virtual: true }
);

const multerMock = Object.assign(
  jest.fn(() => ({
    single: mockSingle,
    array: mockArray,
    memoryStorage: mockMemoryStorage
  })),
  {
    memoryStorage: mockMemoryStorage
  }
);

jest.mock(
  'multer',
  () => ({
    __esModule: true,
    default: multerMock
  }),
  { virtual: true }
);

describe('createUploadRoutes', () => {
  const mockController: UploadController = {
    uploadSingleFile: jest.fn(),
    uploadMultipleFiles: jest.fn(),
    getAllFiles: jest.fn(),
    getFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileMetadata: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSingle.mockReturnValue(jest.fn());
    mockArray.mockReturnValue(jest.fn());
  });

  it('registers all routes with the controller', async () => {
    const { createUploadRoutes } = await import('../uploadRoutes');

    createUploadRoutes({ controller: mockController });

    expect(mockRouter.post).toHaveBeenCalledWith('/single', expect.any(Function), mockController.uploadSingleFile);
    expect(mockRouter.post).toHaveBeenCalledWith('/multiple', expect.any(Function), mockController.uploadMultipleFiles);
    expect(mockRouter.get).toHaveBeenCalledWith('/', mockController.getAllFiles);
    expect(mockRouter.get).toHaveBeenCalledWith('/:filename', mockController.getFile);
    expect(mockRouter.get).toHaveBeenCalledWith('/:filename/metadata', mockController.getFileMetadata);
    expect(mockRouter.delete).toHaveBeenCalledWith('/:filename', mockController.deleteFile);
  });

  it('initializes multer with in-memory storage and the expected upload handlers', async () => {
    const { createUploadRoutes } = await import('../uploadRoutes');

    createUploadRoutes({ controller: mockController });

    expect(mockMemoryStorage).toHaveBeenCalled();
    expect(mockSingle).toHaveBeenCalledWith('file');
    expect(mockArray).toHaveBeenCalledWith('files');
  });
});
