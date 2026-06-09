
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { NewsletterSubscription } from './NewsletterSubscription';

describe('NewsletterSubscription', () => {
  runCommonBlockTests({
    Component: NewsletterSubscription,
    mockBlock: createStandardMockBlock().block,
    paragraphKey: 'Текст 1 абзацу',
  });
});