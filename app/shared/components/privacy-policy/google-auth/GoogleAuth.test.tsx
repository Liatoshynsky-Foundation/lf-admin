
import { usePointsListMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { GoogleAuth } from './GoogleAuth';

const keys = {
  listItem: 'Текст пункту',
  descriptionKey: 'Вступний текст секції',
  note: 'Додаткова інформація'
};

describe('GoogleAuth', () => {
  runCommonBlockTests({
    Component: GoogleAuth,
    mockBlock: createStandardMockBlock().block,
    descriptionKey: keys.descriptionKey,
    noteKey: keys.note,
    usePointsListMock,
  });
});



