
import { usePointsListMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { Cookies } from './Cookies';

describe('Cookies', () => {
  runCommonBlockTests({
    Component: Cookies,
    mockBlock: createStandardMockBlock().block,
    checkDescription: true,
    checkNote: true,
    checkList: true,
    usePointsListMock,
    checkGrip: true,
  });
});



