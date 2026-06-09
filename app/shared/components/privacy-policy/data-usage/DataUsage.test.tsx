import { usePointsListMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { DataUsage } from './DataUsage';

const keys = {
  title: 'Вступний текст секції',
  listItem: 'Текст пункту',
};

describe('DataUsage', () => {
  runCommonBlockTests({
    Component: DataUsage,
    titleKey: keys.title,
    usePointsListMock,
    mockBlock: createStandardMockBlock().block,
  });
});



