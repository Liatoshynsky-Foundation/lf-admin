import { act, renderHook } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import { ChangeEvent } from 'react';

import { useBlockFieldHandlers } from './useBlockFieldHandlers';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { getEventValue } from '~/src/shared/utils/formHelpers';
import { useStore } from '~/store';

type PageId = (typeof PAGE_IDS)[keyof typeof PAGE_IDS];
type BlockId = (typeof BLOCK_IDS)[keyof typeof BLOCK_IDS];

jest.mock('~/store');
jest.mock('~/src/shared/utils/formHelpers');

describe('useBlockFieldHandlers', () => {
  const mockSetField = jest.fn();

  const pageId = 'test-page' as unknown as PageId;
  const blockId = 'test-block' as unknown as BlockId;

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
        result.current.handleLocalizedTextChange('buttonText')(
          { target: { value: 'New english text' } } as unknown as ChangeEvent<HTMLInputElement>
        );
      });

      expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'buttonText', {
        uk: '',
        en: 'New english text'
      });
    });
  });

  describe('handleDescriptionChange', () => {
    it('should correctly update the TipTap description for the current locale', () => {
      const currentLocale = 'uk';
      const blockData = {
        description: {
          en: { type: 'doc', content: [{ type: 'paragraph', content: [] }] }
        }
      };

      const { result } = renderHook(() => useBlockFieldHandlers(pageId, blockId, currentLocale, blockData));

      const newTipTapContent = { type: 'doc', content: [{ type: 'text', text: 'Новий опис' }] };

      act(() => {
        result.current.handleDescriptionChange(newTipTapContent as unknown as JSONContent);
      });

      expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'description', {
        en: blockData.description.en,
        uk: newTipTapContent
      });
    });

    it('should handle missing description object gracefully', () => {
      const currentLocale = 'en';
      const blockData = {};

      const { result } = renderHook(() => useBlockFieldHandlers(pageId, blockId, currentLocale, blockData));

      const newTipTapContent = { type: 'doc', content: [] };

      act(() => {
        result.current.handleDescriptionChange(newTipTapContent as unknown as JSONContent);
      });

      expect(mockSetField).toHaveBeenCalledWith(pageId, blockId, 'description', {
        en: newTipTapContent
      });
    });
  });
});
