
import { usePointsListMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { GoogleAuth } from './GoogleAuth';

describe('GoogleAuth', () => {
  runCommonBlockTests({
    Component: GoogleAuth,
    mockBlock: createStandardMockBlock().block,
    checkDescription: true,
    checkNote: true,
    checkList: true,
    usePointsListMock,
  });
});



