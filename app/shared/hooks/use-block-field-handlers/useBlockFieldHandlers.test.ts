import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent } from 'react';

import { useBlockFieldHandlers } from './useBlockFieldHandlers';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { getEventValue } from '~/src/shared/utils/formHelpers';
import { useStore } from '~/store';
import { LocalizedJSON } from '~/types/common';

jest.mock('~/store');
jest.mock('~/src/shared/utils/formHelpers');

type TestBlockData = {
  description?: Partial<LocalizedJSON>;
};

describe('useBlockFieldHandlers', () => {
  const mockSetField = jest.fn();

  const pageId = PAGE_IDS.WAR_IN_UKRAINE;
  const blockId = BLOCK_IDS.WAR_INFO;

  beforeEach(() => {
    jest.clearAllMocks();

    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ setField: mockSetField }));
  });

  describe('handleLocalizedTextChange', () => {
    it('should correctly update a localized text field using string input', () => {
      const currentLocale = 'uk';
      const blockData = {
        title: { uk: 'Старий текст', en: 'Old text' }
      };

      (getEventValue as jest.Mock).mockReturnValue('Новий текст');

      const { result } = renderHook(() => useBlockFieldHandlers(pageId, blockId, currentLocale, blockData));

      act(() => {
        result.current.handleLocalizedTextChange('title')('Новий текст');
      });

      expect(getEventValue).toHaveBeenCalledWith('Новий текст');
      expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'title', {
        uk: 'Новий текст',
        en: 'Old text'
      });
    });

    it('should handle undefined blockData gracefully and fallback to empty strings', () => {
      const currentLocale = 'en';
      const blockData = undefined;

      (getEventValue as jest.Mock).mockReturnValue('New english text');

      const { result } = renderHook(() => useBlockFieldHandlers(pageId, blockId, currentLocale, blockData));

      act(() => {
        result.current.handleLocalizedTextChange('buttonText')({
          target: { value: 'New english text' }
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'buttonText', {
        uk: '',
        en: 'New english text'
      });
    });
  });

  describe('handleLocalizedContentChange', () => {
    it('should correctly update the TipTap description for the current locale', () => {
      const currentLocale = 'uk';
      const blockData: TestBlockData = {
        description: {
          en: { type: 'doc', content: [{ type: 'paragraph', content: [] }] }
        }
      };

      const { result } = renderHook(() => useBlockFieldHandlers(pageId, blockId, currentLocale, blockData));

      const newTipTapContent = { type: 'doc', content: [{ type: 'text', text: 'Новий опис' }] };

      act(() => {
        result.current.handleLocalizedContentChange('description')(newTipTapContent);
      });

      expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'description', {
        en: blockData.description?.en,
        uk: newTipTapContent
      });
    });

    it('should handle missing description object gracefully', () => {
      const currentLocale = 'en';
      const blockData: TestBlockData = {};

      const { result } = renderHook(() => useBlockFieldHandlers(pageId, blockId, currentLocale, blockData));

      const newTipTapContent = { type: 'doc', content: [] };

      act(() => {
        result.current.handleLocalizedContentChange('description')(newTipTapContent);
      });

      expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'description', {
        en: newTipTapContent
      });
    });
  });
});
