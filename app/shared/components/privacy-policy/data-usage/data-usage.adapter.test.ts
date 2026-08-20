import { dataUsageAdapter } from './data-usage.adapter';
import { createDocNode } from '~/__mocks__/utils';
import { CONTENT_TYPE } from '~/types/blocks/contentTypes';
import type { DataUsageBlock } from '~/types/store/pages/privacy-policy';

const buildBlock = (overrides?: Omit<Partial<DataUsageBlock>, 'hidden'>): DataUsageBlock => ({
  title: { uk: createDocNode('Заголовок UK'), en: createDocNode('Title EN') },
  description: { uk: createDocNode('Опис UK'), en: createDocNode('Description EN') },
  list: [
    { id: 'item-1', uk: createDocNode('Пункт 1'), en: createDocNode('Item 1') },
    { id: 'item-2', uk: createDocNode('Пункт 2'), en: createDocNode('Item 2') }
  ],
  hidden: false,
  ...overrides
});

describe('dataUsageAdapter', () => {
  describe('toContent', () => {
    it('maps block title and list to header and list content items', () => {
      const block = buildBlock();

      const result = dataUsageAdapter.toContent(block);

      expect(result).toEqual([
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        { id: 'list', type: CONTENT_TYPE.LIST, items: block.list }
      ]);
    });

    it('falls back to an empty list when block.list is undefined', () => {
      const block = buildBlock({ list: undefined as unknown as DataUsageBlock['list'] });

      const result = dataUsageAdapter.toContent(block);

      expect(result).toEqual([
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        { id: 'list', type: CONTENT_TYPE.LIST, items: [] }
      ]);
    });
  });

  describe('fromContent', () => {
    it('extracts title and list from content items', () => {
      const block = buildBlock();
      const content = dataUsageAdapter.toContent(block);

      const result = dataUsageAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: block.title,
        list: block.list
      });
    });

    it('returns an empty object when content is empty', () => {
      const block = buildBlock();

      const result = dataUsageAdapter.fromContent([], block);

      expect(result).toEqual({});
    });

    it('returns only title when list item is missing', () => {
      const block = buildBlock();
      const content = [{ id: 'title', type: CONTENT_TYPE.HEADER, title: block.title }];

      const result = dataUsageAdapter.fromContent(content, block);

      expect(result).toEqual({ title: block.title });
    });

    it('returns only list when header item is missing', () => {
      const block = buildBlock();
      const content = [{ id: 'list', type: CONTENT_TYPE.LIST, items: block.list }];

      const result = dataUsageAdapter.fromContent(content, block);

      expect(result).toEqual({ list: block.list });
    });
  });
});
