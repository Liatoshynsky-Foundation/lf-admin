
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { TargetedAds } from './TargetedAds';

describe('TargetedAds', () => {
  runCommonBlockTests({
    Component: TargetedAds,
    mockBlock: createStandardMockBlock().block,
    checkParagraph: true,
  });
});

