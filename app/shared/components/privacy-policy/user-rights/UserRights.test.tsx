import { usePointsListMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { UserRights } from './UserRights';

export const keys = {
  listItem: 'Текст пункту',
  description: 'Вступний текст секції',
  note: 'Додаткова інформація'
};

describe('UserRights', () => {
  runCommonBlockTests({
    Component: UserRights,
    mockBlock: createStandardMockBlock().block,
    descriptionKey: keys.description,
    noteKey: keys.note,
    usePointsListMock,
  });
});



