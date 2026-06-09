
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { TargetedAds } from './TargetedAds';

const keys = {
  listItem: 'Текст пункту',
  paragraphKey: 'Текст 1 абзацу',
  note: 'Додаткова інформація'
};
describe('TargetedAds', () => {
  runCommonBlockTests({
    Component: TargetedAds,
    mockBlock: createStandardMockBlock().block,
    paragraphKey: keys.paragraphKey,
  });
});

