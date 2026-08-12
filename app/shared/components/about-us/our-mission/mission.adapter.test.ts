import { missionAdapter } from './mission.adapter';
import { createDocNode } from '~/__mocks__/utils';
import { CROP_RATIOS } from '~/constants/publications';
import { generateUniqueId } from '~/lib/utils/generateUniqueId';
import { CONTENT_TYPE } from '~/types/blocks/contentTypes';
import type { ProseDoc } from '~/types/common';
import type { OurMissionBlock } from '~/types/store/pages/about-us/blocks/missionBlock';

jest.mock('~/lib/utils/generateUniqueId', () => ({
  generateUniqueId: jest.fn()
}));

const createProseDoc = (text: string): ProseDoc => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
});

const buildImage = (name: string) => ({
  src: `https://example.com/${name}.jpg`,
  alt: { uk: createDocNode(`${name} alt UK`), en: createDocNode(`${name} alt EN`) },
  caption: { uk: createDocNode(`${name} caption UK`), en: createDocNode(`${name} caption EN`) },
  generatedSrc: `https://example.com/${name}-generated.jpg`
});

const buildBlock = (overrides?: Omit<Partial<OurMissionBlock>, 'hidden'>): OurMissionBlock => ({
  title: { uk: createProseDoc('Заголовок UK'), en: createProseDoc('Title EN') },
  list: [
    { uk: createProseDoc('Пункт 1 UK'), en: createProseDoc('Item 1 EN') },
    { uk: createProseDoc('Пункт 2 UK'), en: createProseDoc('Item 2 EN') }
  ],
  smallImage: buildImage('small'),
  bigImage: buildImage('big'),
  hidden: false,
  ...overrides
});

const listWithIds = (list: OurMissionBlock['list']) =>
  list.map((item, index) => ({ ...item, id: `list-id-${index + 1}` }));

describe('missionAdapter', () => {
  beforeEach(() => {
    jest.mocked(generateUniqueId).mockReset();
    jest.mocked(generateUniqueId).mockReturnValueOnce('list-id-1').mockReturnValueOnce('list-id-2');
  });

  describe('toContent', () => {
    it('maps block fields to header, list and image content items', () => {
      const block = buildBlock();

      const result = missionAdapter.toContent(block);

      expect(result).toEqual([
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        {
          id: 'list',
          type: CONTENT_TYPE.LIST,
          items: listWithIds(block.list),
          label: 'Текст секції:'
        },
        {
          id: 'smallImage',
          type: CONTENT_TYPE.IMAGE,
          value: block.smallImage,
          label: 'Перше зображення секції',
          aspectRatio: CROP_RATIOS.FUNDATION_PROFILE_SMALL
        },
        {
          id: 'bigImage',
          type: CONTENT_TYPE.IMAGE,
          value: block.bigImage,
          label: 'Друге зображення секції',
          aspectRatio: CROP_RATIOS.FUNDATION_PROFILE_BIG
        }
      ]);
    });

    it('falls back to an empty list when block.list is undefined', () => {
      const block = buildBlock({ list: undefined as unknown as OurMissionBlock['list'] });

      const result = missionAdapter.toContent(block);

      expect(result[1]).toEqual({
        id: 'list',
        type: CONTENT_TYPE.LIST,
        items: [],
        label: 'Текст секції:'
      });
    });
  });

  describe('fromContent', () => {
    it('extracts title, list and images from content items', () => {
      const block = buildBlock();
      const content = missionAdapter.toContent(block);

      const result = missionAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: block.title,
        list: listWithIds(block.list),
        smallImage: block.smallImage,
        bigImage: block.bigImage
      });
    });

    it('returns an empty object when content is empty', () => {
      const block = buildBlock();

      const result = missionAdapter.fromContent([], block);

      expect(result).toEqual({});
    });

    it('returns only present fields when some content items are missing', () => {
      const block = buildBlock();
      const content = [
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        {
          id: 'smallImage',
          type: CONTENT_TYPE.IMAGE,
          value: block.smallImage,
          label: 'Перше зображення секції',
          aspectRatio: CROP_RATIOS.FUNDATION_PROFILE_SMALL
        }
      ];

      const result = missionAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: block.title,
        smallImage: block.smallImage
      });
    });
  });
});
