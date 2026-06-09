
import { usePageBlockMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { NewsletterSubscription } from './NewsletterSubscription';

describe('NewsletterSubscription', () => {
  runCommonBlockTests({
    Component: NewsletterSubscription,
    mockBlock: createStandardMockBlock().block,
    usePageBlockMock,
    descriptionParagraphKey: 'Текст 1 абзацу',
  });
});

