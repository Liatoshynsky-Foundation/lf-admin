import { fireEvent, render, screen } from '@testing-library/react';

import { usePageBlockMock,useSectionListMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { DataWeCollect } from './DataWeCollect';
import { createDocNode } from '~/__mocks__/utils';
import { DataWeCollectBlock } from '~/types/store/pages/privacy-policy';

jest.mock('~/components/configurable-list/ConfigurableList');
jest.mock('~/shared/hooks/use-section-list/useSectionList', () => ({
  useSectionList: useSectionListMock
}));

const { block: standardMockBlock } = createStandardMockBlock();

const mockNoteJson = createDocNode('Initial note');
const mockSubtitleJson = createDocNode('Initial subtitle');
const mockListItem1 = createDocNode('Initial list item 1');

const mockBlock: DataWeCollectBlock = {
  ...standardMockBlock,
  sections: [{ id: '1', list: [{ uk: mockListItem1, en: mockListItem1 }], subtitle: { uk: mockSubtitleJson, en: mockSubtitleJson } }],
  note: { uk: mockNoteJson, en: mockNoteJson },
};

describe('DataWeCollect', () => {
  runCommonBlockTests({
    Component: DataWeCollect,
    mockBlock,
    checkDescription: true,
    checkNote: true,
    checkList: true,
    useSectionListMock,
    checkGrip: true,
  });

  it('should handle drag-and-drop reordering', () => {
    const mockUpdateSectionList = jest.fn();

    const point1 = { id: 'p1', uk: createDocNode('pt1'), en: createDocNode('pt1') };
    const point2 = { id: 'p2', uk: createDocNode('pt2'), en: createDocNode('pt2') };

    useSectionListMock.mockReturnValue({
      addListPoint: jest.fn(),
      removeListPoint: jest.fn(),
      updateListPoint: jest.fn(),
      updateSectionSubtitle: jest.fn(),
      updateSectionList: mockUpdateSectionList,
      sections: [{ 
        id: 'section-1', 
        title: createDocNode('Mock Title'), 
        points: [point1, point2] 
      }]
    });
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<DataWeCollect />);
    fireEvent.click(screen.getByTestId('mock-sortable-list'));
    expect(mockUpdateSectionList).toHaveBeenCalledWith(
      'section-1',
      [point2, point1]
    );
  });
});
