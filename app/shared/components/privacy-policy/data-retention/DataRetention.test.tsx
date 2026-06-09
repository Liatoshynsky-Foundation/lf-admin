
import { usePageBlockMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { DataRetention } from './DataRetention';


describe('DataRetention', () => {
  runCommonBlockTests({
    Component: DataRetention,
    mockBlock: createStandardMockBlock().block,
    usePageBlockMock,
    descriptionParagraphKey: 'Текст 1 абзацу',
  });
});

