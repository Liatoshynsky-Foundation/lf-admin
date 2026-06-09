
import { usePointsListMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { DataWeCollect } from './DataWeCollect';
import { createDocNode } from '~/__mocks__/utils';
import { DataWeCollectBlock } from '~/types/store/pages/privacy-policy';


jest.mock('~/components/configurable-list/ConfigurableList');

const { block: standardMockBlock } = createStandardMockBlock();

const mockNoteJson = createDocNode('Initial note');
const mockSubtitleJson = createDocNode('Initial subtitle');
const mockListItem1 = createDocNode('Initial list item 1');

const mockBlock: DataWeCollectBlock = {
  ...standardMockBlock,
  sections: [{ id: '1', list: [{ uk: mockListItem1, en: mockListItem1 }], subtitle: { uk: mockSubtitleJson, en: mockSubtitleJson } }],
  note: { uk: mockNoteJson, en: mockNoteJson },
};

const keys = {
  description: 'Вступний текст секції',
  list: 'Список 1',
  listItem: 'Текст пункту',
  note: 'Додаткова інформація',
};
describe('DataWeCollect', () => {
  runCommonBlockTests({
    Component: DataWeCollect,
    mockBlock,
    descriptionKey: keys.description,
    noteKey: keys.note,
    usePointsListMock: usePointsListMock
  });
});



