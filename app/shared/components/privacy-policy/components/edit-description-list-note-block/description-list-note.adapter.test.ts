import { descriptionListNoteAdapter, type DescriptionListNoteBlock } from './description-list-note.adapter';
import { createDocNode } from '~/__mocks__/utils';
import { CONTENT_TYPE } from '~/types/blocks/contentTypes';

const buildBlock = (overrides?: Partial<DescriptionListNoteBlock>): DescriptionListNoteBlock => ({
  title: { uk: createDocNode('Заголовок UK'), en: createDocNode('Title EN') },
  description: { uk: createDocNode('Опис UK'), en: createDocNode('Description EN') },
  list: [
    { id: 'item-1', uk: createDocNode('Пункт 1'), en: createDocNode('Item 1') },
    { id: 'item-2', uk: createDocNode('Пункт 2'), en: createDocNode('Item 2') }
  ],
  note: { uk: createDocNode('Примітка UK'), en: createDocNode('Note EN') },
  ...overrides
});

describe('descriptionListNoteAdapter', () => {
  describe('toContent', () => {
    it('maps block fields to header, paragraph, list and note content items', () => {
      const block = buildBlock();

      const result = descriptionListNoteAdapter.toContent(block);

      expect(result).toEqual([
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        {
          id: 'description',
          type: CONTENT_TYPE.PARAGRAPH,
          value: block.description,
          label: 'Вступний текст секції'
        },
        { id: 'list', type: CONTENT_TYPE.LIST, items: block.list },
        {
          id: 'note',
          type: CONTENT_TYPE.PARAGRAPH,
          value: block.note,
          label: 'Додаткова інформація'
        }
      ]);
    });

    it('falls back to an empty list when block.list is undefined', () => {
      const block = buildBlock({ list: undefined as unknown as DescriptionListNoteBlock['list'] });

      const result = descriptionListNoteAdapter.toContent(block);

      expect(result).toEqual([
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        {
          id: 'description',
          type: CONTENT_TYPE.PARAGRAPH,
          value: block.description,
          label: 'Вступний текст секції'
        },
        { id: 'list', type: CONTENT_TYPE.LIST, items: [] },
        {
          id: 'note',
          type: CONTENT_TYPE.PARAGRAPH,
          value: block.note,
          label: 'Додаткова інформація'
        }
      ]);
    });
  });

  describe('fromContent', () => {
    it('extracts title, description, list and note from content items', () => {
      const block = buildBlock();
      const content = descriptionListNoteAdapter.toContent(block);

      const result = descriptionListNoteAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: block.title,
        description: block.description,
        list: block.list,
        note: block.note
      });
    });

    it('returns undefined fields when content is empty', () => {
      const block = buildBlock();

      const result = descriptionListNoteAdapter.fromContent([], block);

      expect(result).toEqual({
        title: undefined,
        description: undefined,
        list: undefined,
        note: undefined
      });
    });

    it('returns only present fields when some content items are missing', () => {
      const block = buildBlock();
      const content = [
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        { id: 'note', type: CONTENT_TYPE.PARAGRAPH, value: block.note, label: 'Додаткова інформація' }
      ];

      const result = descriptionListNoteAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: block.title,
        description: undefined,
        list: undefined,
        note: block.note
      });
    });
  });
});
