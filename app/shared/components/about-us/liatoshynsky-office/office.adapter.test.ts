import { officeAdapter } from './office.adapter';
import { createDocNode } from '~/__mocks__/utils';
import { CONTENT_TYPE } from '~/types/blocks/contentTypes';
import type { LiatoshynskyOfficeBlock } from '~/types/store/pages/about-us/blocks/liatoshynskyOfficeBlock';

const buildBlock = (overrides?: Omit<Partial<LiatoshynskyOfficeBlock>, 'hidden'>): LiatoshynskyOfficeBlock => ({
  quote: {
    text: { uk: createDocNode('Цитата UK'), en: createDocNode('Quote EN') },
    source: { uk: createDocNode('Джерело UK'), en: createDocNode('Source EN') }
  },
  hidden: false,
  ...overrides
});

describe('officeAdapter', () => {
  describe('toContent', () => {
    it('maps the quote to a quote content item', () => {
      const block = buildBlock();

      const result = officeAdapter.toContent(block);

      expect(result).toEqual([
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
    it('extracts the quote from content item', () => {
      const block = buildBlock();
      const content = officeAdapter.toContent(block);

      const result = officeAdapter.fromContent(content, block);

      expect(result).toEqual({
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
        quote: {
          source: undefined,
          text: undefined
        }
      });
    });
  });
});
