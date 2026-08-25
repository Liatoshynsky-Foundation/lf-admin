import { officeAdapter } from './office.adapter';
import { createDocNode } from '~/__mocks__/utils';
import { CONTENT_TYPE } from '~/types/blocks/contentTypes';
import type { LiatoshynskyOfficeBlock } from '~/types/store/pages/about-us/blocks/liatoshynskyOfficeBlock';

const emptyLocalizedJSON = {
  uk: { type: 'doc', content: [] },
  en: { type: 'doc', content: [] }
};

const buildBlock = (overrides?: Omit<Partial<LiatoshynskyOfficeBlock>, 'hidden'>): LiatoshynskyOfficeBlock => ({
  title: { uk: createDocNode('Заголовок UK'), en: createDocNode('Title EN') },
  quote: {
    text: { uk: createDocNode('Цитата UK'), en: createDocNode('Quote EN') },
    source: { uk: createDocNode('Джерело UK'), en: createDocNode('Source EN') }
  },
  hidden: false,
  ...overrides
});

describe('officeAdapter', () => {
  describe('toContent', () => {
    it('maps block title and quote to header and quote content items', () => {
      const block = buildBlock();

      const result = officeAdapter.toContent(block);

      expect(result).toEqual([
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        {
          id: 'quote',
          type: CONTENT_TYPE.QUOTE,
          source: block.quote.source,
          text: block.quote.text
        }
      ]);
    });

    it('falls back to empty localized JSON when block.title is undefined', () => {
      const block = buildBlock({ title: undefined });

      const result = officeAdapter.toContent(block);

      expect(result).toEqual([
        { id: 'title', type: CONTENT_TYPE.HEADER, title: emptyLocalizedJSON },
        {
          id: 'quote',
          type: CONTENT_TYPE.QUOTE,
          source: block.quote.source,
          text: block.quote.text
        }
      ]);
    });
  });

  describe('fromContent', () => {
    it('extracts title and quote from content items', () => {
      const block = buildBlock();
      const content = officeAdapter.toContent(block);

      const result = officeAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: block.title,
        quote: {
          source: block.quote.source,
          text: block.quote.text
        }
      });
    });

    it('returns undefined fields when content is empty', () => {
      const block = buildBlock();

      const result = officeAdapter.fromContent([], block);

      expect(result).toEqual({
        title: undefined,
        quote: {
          source: undefined,
          text: undefined
        }
      });
    });

    it('returns only present fields when some content items are missing', () => {
      const block = buildBlock();
      const content = [{ id: 'title', type: CONTENT_TYPE.HEADER, title: block.title! }];

      const result = officeAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: block.title,
        quote: {
          source: undefined,
          text: undefined
        }
      });
    });
  });
});
