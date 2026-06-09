
export const usePageBlockMock = jest.fn();
export const setFieldMock = jest.fn();

export const mockAddPoint = jest.fn();
export const mockRemovePoint = jest.fn();
export const mockUpdatePoint = jest.fn();

jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => usePageBlockMock()
}));

jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/ds-components/text-field/TextField');

beforeAll(() => {
  crypto.randomUUID = jest.fn(() => 'uuid-1') as typeof crypto.randomUUID;
});