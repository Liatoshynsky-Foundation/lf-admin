import { fireEvent, render, screen } from '@testing-library/react';

import { mockSetField, usePageBlockMock, usePointsListMock } from '../__mocks__/setup-mocks';
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { Cookies } from './Cookies';
import { createDocNode } from '~/__mocks__/utils';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';

describe('Cookies', () => {
  runCommonBlockTests({
    Component: Cookies,
    mockBlock: createStandardMockBlock().block,
    checkDescription: true,
    checkNote: true,
    checkList: true,
    usePointsListMock,
    checkGrip: true,
    checkToggleVisibility: true,
    blockId: BLOCK_IDS.COOKIES,
  });

  it('should update the section title, merging into the existing localized title', () => {
    usePageBlockMock.mockReturnValue({ block: createStandardMockBlock().block });

    render(<Cookies />);

    fireEvent.click(screen.getByTestId('trigger-change-Заголовок секції'));

    expect(mockSetField).toHaveBeenCalledWith(
      PAGE_IDS.PRIVACY_POLICY,
      BLOCK_IDS.COOKIES,
      'title',
      expect.objectContaining({ uk: createDocNode('Updated Заголовок секції') })
    );
  });
});



