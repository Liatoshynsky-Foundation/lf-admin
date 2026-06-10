import { usePointsListMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { UserRights } from './UserRights';

describe('UserRights', () => {
  runCommonBlockTests({
    Component: UserRights,
    mockBlock: createStandardMockBlock().block,
    checkDescription: true,
    checkNote: true,
    checkList: true,
    usePointsListMock,
  });
});



