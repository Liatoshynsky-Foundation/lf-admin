
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { TargetedAds } from './TargetedAds';


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

const usePageBlockMock = jest.fn();
const setFieldMock = jest.fn();

describe('TargetedAds', () => {
  runCommonBlockTests({
    Component: TargetedAds,
    mockBlock: createStandardMockBlock().block,
    usePageBlockMock,
    descriptionParagraphKey: 'Текст 1 абзацу',
  });
});

