import { CaseType, formatCipher } from './caseType';
import { Case } from '~/src/domain/entities/Case';
import { IFondRepository } from '~/src/domain/repositories/fondRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockFondFindById = jest.fn();

const mockFondRepo: Partial<IFondRepository> = {
  findById: mockFondFindById
};

const createContext = () =>
  ({
    requestContainer: {
      cradle: {
        fondRepository: mockFondRepo
      }
    }
  }) as never;

const mockCase: Case = {
  id: 'case-id',
  fondId: 'fond-id',
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
  it('should format the cipher according to the strict "Ф. {fondNumber}, оп. {descriptionNumber}, спр. {caseNumber}" pattern', () => {
    expect(formatCipher(1, 1, 3)).toBe('Ф. 1, оп. 1, спр. 3');
  });
});

describe('CaseType.cipher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve the cipher using the parent Case and its Fond number', async () => {
    mockFondFindById.mockResolvedValue({ id: 'fond-id', fondNumber: 1 });

    const result = await CaseType.cipher(mockCase, {}, createContext());

    expect(mockFondFindById).toHaveBeenCalledWith('fond-id');
    expect(result).toBe('Ф. 1, оп. 1, спр. 3');
  });

  it('should fall back to 0 for fondNumber when the referenced Fond cannot be found', async () => {
    mockFondFindById.mockResolvedValue(null);

    const result = await CaseType.cipher(mockCase, {}, createContext());

    expect(result).toBe('Ф. 0, оп. 1, спр. 3');
  });
});
