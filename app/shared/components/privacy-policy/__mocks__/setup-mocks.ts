
export const usePageBlockMock = jest.fn();
export const useSectionListMock = jest.fn();
export const usePointsListMock = jest.fn();
export const mockSetField = jest.fn();
export const mockToggleBlockVisibility = jest.fn();

export const mockAddPoint = jest.fn();
export const mockRemovePoint = jest.fn();
export const mockUpdatePoint = jest.fn();

export const mockStoreState = {
  locale: 'uk',
  setField: mockSetField,
  toggleBlockVisibility: mockToggleBlockVisibility
};

export const setMockLocale = (locale: 'uk' | 'en') => {
  mockStoreState.locale = locale;
};

jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => usePageBlockMock()
}));

jest.mock('~/store', () => ({
  useStore: (selector: (state: typeof mockStoreState) => unknown) => 
    selector(mockStoreState)
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/ds-components/text-field/TextField');
jest.mock('~/shared/components/privacy-policy/components/points-list/PointsList');
jest.mock('~/shared/components/sortable-list/SortableList');
jest.mock('~/components/grip/Grip');

const MOCK_UUID = 'uuid-1';

let originalCrypto: any;
beforeAll(() => {
  originalCrypto = globalThis.crypto;

  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...originalCrypto,
      randomUUID: jest.fn().mockReturnValue(MOCK_UUID), 
    },
    configurable: true, 
  });
});

afterAll(() => {
  if (originalCrypto) {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true,
    });
  } else {
    delete (globalThis as any).crypto;
  }
});