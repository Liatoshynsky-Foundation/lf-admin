import { usePointsListMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { DataUsage } from './DataUsage';

describe('DataUsage', () => {
  runCommonBlockTests({
    Component: DataUsage,
    checkTitle: true,
    checkList: true,
    usePointsListMock,
    mockBlock: createStandardMockBlock().block,
  });
});



