import { whatWeDoAdapter } from './what-we-do.adapter';
import { createDocNode } from '~/__mocks__/utils';
import { CONTENT_TYPE } from '~/types/blocks/contentTypes';
import type { WhatWeDoBlock } from '~/types/store/pages/about-us/blocks/whatWeDoBlock';

const buildBlock = (overrides?: Omit<Partial<WhatWeDoBlock>, 'hidden'>): WhatWeDoBlock => ({
  title: { uk: createDocNode('Заголовок UK'), en: createDocNode('Title EN') },
  items: [
    {
      id: 'item-1',
      title: { uk: createDocNode('Пункт 1'), en: createDocNode('Item 1') },
      description: { uk: createDocNode('Опис 1'), en: createDocNode('Description 1') }
    },
    {
      id: 'item-2',
      title: { uk: createDocNode('Пункт 2'), en: createDocNode('Item 2') },
      description: { uk: createDocNode('Опис 2'), en: createDocNode('Description 2') }
    }
  ],
  hidden: false,
  ...overrides
});

describe('whatWeDoAdapter', () => {
  describe('toContent', () => {
    it('maps block title and items to header and section-list content items', () => {
      const block = buildBlock();

      const result = whatWeDoAdapter.toContent(block);

      expect(result).toEqual([
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        {
          id: 'items',
          type: CONTENT_TYPE.SECTION_LIST,
          items: block.items,
          label: 'Пункти секції:'
        }
      ]);
    });

    it('falls back to an empty list when block.items is undefined', () => {
      const block = buildBlock({ items: undefined as unknown as WhatWeDoBlock['items'] });

      const result = whatWeDoAdapter.toContent(block);

      expect(result).toEqual([
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        {
          id: 'items',
          type: CONTENT_TYPE.SECTION_LIST,
          items: [],
          label: 'Пункти секції:'
        }
      ]);
    });
  });

  describe('fromContent', () => {
    it('extracts title and items from content items', () => {
      const block = buildBlock();
      const content = whatWeDoAdapter.toContent(block);

      const result = whatWeDoAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: block.title,
        items: block.items
      });
    });

    it('returns undefined fields when content is empty', () => {
      const block = buildBlock();

      const result = whatWeDoAdapter.fromContent([], block);

      expect(result).toEqual({
        title: undefined,
        items: undefined
      });
    });

    it('returns only present fields when some content items are missing', () => {
      const block = buildBlock();
      const content = [
        {
          id: 'items',
          type: CONTENT_TYPE.SECTION_LIST,
          items: block.items,
          label: 'Пункти секції:'
        }
      ];

      const result = whatWeDoAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: undefined,
        items: block.items
      });
    });
  });
});
