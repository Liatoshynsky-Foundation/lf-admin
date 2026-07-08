import { initializeUploadModule } from '../../../src/uploads/initialize';
import { getUploadModule, parseFormDataOptions } from './upload-handler';

jest.mock('../../../src/config', () => ({ config: {} }));
jest.mock('../../../src/uploads/initialize');

describe('upload-handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUploadModule initializes only once', () => {
    const mockModule = { uploadService: {} };
    (initializeUploadModule as jest.Mock).mockReturnValue(mockModule);

    const first = getUploadModule();
    const second = getUploadModule();

    expect(initializeUploadModule).toHaveBeenCalledTimes(1);
    expect(first).toBe(mockModule);
    expect(second).toBe(mockModule);
  });

  test('parseFormDataOptions with valid data', () => {
    const fd = new FormData();
    fd.append('fileType', 'image');
    fd.append('directory', 'uploads');
    fd.append('validationRules', JSON.stringify({ min: 1 }));
    fd.append('metadata', JSON.stringify({ key: 'val' }));

    const res = parseFormDataOptions(fd);

    expect(res).toEqual({
      fileType: 'image',
      directory: 'uploads',
      validationRules: { min: 1 },
      metadata: { key: 'val' }
    });
  });

  test('parseFormDataOptions ignores non-string inputs', () => {
    const fd = new FormData();
    fd.append('fileType', new File([], 'f'));
    fd.append('directory', new File([], 'd'));

    const res = parseFormDataOptions(fd);

    expect(res).toEqual({
      validationRules: undefined,
      metadata: undefined
    });
  });

  test('parseFormDataOptions handles invalid json strings', () => {
    const fd = new FormData();
    fd.append('validationRules', 'bad-json');
    fd.append('metadata', '{ invalid }');

    const res = parseFormDataOptions(fd);

    expect(res.validationRules).toBeUndefined();
    expect(res.metadata).toBeUndefined();
  });

  test('tryParse handles non-string values safely', () => {
    const fd = new FormData();
    fd.append('validationRules', new File([], 'test.txt'));

    const res = parseFormDataOptions(fd);

    expect(res.validationRules).toBeUndefined();
  });
});
