
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { SocialNetworks } from './SocialNetworks';

describe('SocialNetworks', () => {
  runCommonBlockTests({
    Component: SocialNetworks,
    mockBlock: createStandardMockBlock().block,
    paragraphKey: 'Текст 1 абзацу',
  });
});

