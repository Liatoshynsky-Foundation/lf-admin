import { fireEvent, render, screen } from '@testing-library/react';

import { mockSetField, mockSetFieldValidity, usePageBlockMock, usePointsListMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { DataUsage } from './DataUsage';
import { createDocNode } from '~/__mocks__/utils';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';

describe('DataUsage', () => {
  runCommonBlockTests({
    Component: DataUsage,
    checkTitle: true,
    checkList: true,
    usePointsListMock,
    mockBlock: createStandardMockBlock().block,
    checkGrip: true,
    checkToggleVisibility: true,
    blockId: BLOCK_IDS.DATA_USAGE,
  });

  it('should handle drag-and-drop reordering', () => {
    const doubleMockBlock = {
      title: { uk: createDocNode('Initial title') },
      list: [
        { id: '1', uk: createDocNode('Point 1'), en: createDocNode('Point 1') },
        { id: '2', uk: createDocNode('Point 2'), en: createDocNode('Point 2') },
      ],
    };
    usePageBlockMock.mockReturnValue({ block: doubleMockBlock });

    render(<DataUsage />);

    fireEvent.click(screen.getByTestId('mock-sortable-list'));

    expect(mockSetField).toHaveBeenCalledWith(
      PAGE_IDS.PRIVACY_POLICY,
      BLOCK_IDS.DATA_USAGE,
      'list',
      [doubleMockBlock.list[1], doubleMockBlock.list[0]]
    );
  });

  it('should update the section title via onChange, merging into the existing localized title', () => {
    usePageBlockMock.mockReturnValue({ block: createStandardMockBlock().block });

    render(<DataUsage />);
    fireEvent.click(screen.getByTestId('trigger-change-Вступний текст секції'));

    expect(mockSetField).toHaveBeenCalledWith(
      PAGE_IDS.PRIVACY_POLICY,
      BLOCK_IDS.DATA_USAGE,
      'title',
      expect.objectContaining({ uk: createDocNode('Updated Вступний текст секції') })
    );
  });

  it('should mark the title as invalid after blur when it is empty, and clear the flag on unmount', () => {
    usePageBlockMock.mockReturnValue({
      block: { ...createStandardMockBlock().block, title: { uk: { type: 'doc', content: [] } } }
    });

    const { unmount } = render(<DataUsage />);

    fireEvent.click(screen.getByTestId('trigger-blur-Вступний текст секції'));

    expect(screen.getByTestId('textfield-error-Вступний текст секції')).toBeInTheDocument();
    expect(mockSetFieldValidity).toHaveBeenCalledWith(`${PAGE_IDS.PRIVACY_POLICY}:${BLOCK_IDS.DATA_USAGE}:title`, true);

    unmount();

    expect(mockSetFieldValidity).toHaveBeenLastCalledWith(`${PAGE_IDS.PRIVACY_POLICY}:${BLOCK_IDS.DATA_USAGE}:title`, false);
  });
});
