
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { DataRetention } from './DataRetention';


describe('DataRetention', () => {
  runCommonBlockTests({
    Component: DataRetention,
    mockBlock: createStandardMockBlock().block,
    paragraphKey: 'Текст 1 абзацу',
  });
});

