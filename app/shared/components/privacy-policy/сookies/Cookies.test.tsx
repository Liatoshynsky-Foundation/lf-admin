
import { usePointsListMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { Cookies } from './Cookies';

const keys = {
  listItem: 'Текст пункту',
  descriptionKey: 'Вступний текст секції',
  note: 'Додаткова інформація'
};

describe('Cookies', () => {
  runCommonBlockTests({
    Component: Cookies,
    mockBlock: createStandardMockBlock().block,
    descriptionKey: keys.descriptionKey,
    noteKey: keys.note,
    usePointsListMock,
  });
});



