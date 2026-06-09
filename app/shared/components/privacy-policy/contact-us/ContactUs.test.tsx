
import { usePageBlockMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { ContactUs } from './ContactUs';

describe('ContactUs', () => {
  runCommonBlockTests({
    Component: ContactUs,
    mockBlock: createStandardMockBlock().block,
    usePageBlockMock,
    descriptionParagraphKey: 'Текст 1 абзацу',
  });
});

