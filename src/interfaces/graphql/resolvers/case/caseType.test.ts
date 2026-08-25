import { createMockContext } from '../testUtils';
import { CaseType, formatCipher } from './caseType';
import { Case } from '~/src/domain/entities/Case';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockFundLoaderLoad = jest.fn();

const mockFundLoader = {
  load: mockFundLoaderLoad
};

const createContext = () => createMockContext(true, 'fundLoader', mockFundLoader);

const mockCase: Case = {
  id: 'case-id',
  fundId: 'fund-id',
  descriptionNumber: 1,
  caseNumber: 3,
  caseName: { uk: 'Справа', en: 'Case' },
  caseDate: { uk: '1917', en: '1917' },
  sheetsNumber: 10,
  caseDescriptions: { uk: 'Опис', en: 'Description' },
  status: BaseContentStatuses.Published,
  createdAt: '2026-07-29T10:00:00.000Z',
  updatedAt: '2026-07-29T10:00:00.000Z'
};

describe('formatCipher', () => {
  it('should format the cipher according to the strict "Ф. {fundNumber}, оп. {descriptionNumber}, спр. {caseNumber}" pattern', () => {
    expect(formatCipher(1, 1, 3)).toBe('Ф. 1, оп. 1, спр. 3');
  });
});

describe('CaseType.cipher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve the cipher using the parent Case and its Fund number via the batching fundLoader', async () => {
    mockFundLoaderLoad.mockResolvedValue({ id: 'fund-id', fundNumber: 1 });

    const result = await CaseType.cipher(mockCase, {}, createContext());

    expect(mockFundLoaderLoad).toHaveBeenCalledWith('fund-id');
    expect(result).toBe('Ф. 1, оп. 1, спр. 3');
  });

  it('should fall back to 0 for fundNumber when the referenced Fund cannot be found', async () => {
    mockFundLoaderLoad.mockResolvedValue(null);

    const result = await CaseType.cipher(mockCase, {}, createContext());

    expect(result).toBe('Ф. 0, оп. 1, спр. 3');
  });
});
