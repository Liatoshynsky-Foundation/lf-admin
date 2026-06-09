
import { usePageBlockMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { SocialNetworks } from './SocialNetworks';


describe('SocialNetworks', () => {
  runCommonBlockTests({
    Component: SocialNetworks,
    mockBlock: createStandardMockBlock().block,
    usePageBlockMock,
    descriptionParagraphKey: 'Текст 1 абзацу',
  });
});

