import { foundationAdapter } from './foundation.adapter';
import { createDocNode } from '~/__mocks__/utils';
import { CROP_RATIOS } from '~/constants/publications';
import { CONTENT_TYPE } from '~/types/blocks/contentTypes';
import type { FoundationInfo } from '~/types/store/pages/about-us/blocks/liatoshynskyFoundationBlock';

const buildImage = (name: string) => ({
  src: `https://example.com/${name}.jpg`,
  alt: { uk: createDocNode(`${name} alt UK`), en: createDocNode(`${name} alt EN`) },
  caption: { uk: createDocNode(`${name} caption UK`), en: createDocNode(`${name} caption EN`) },
  generatedSrc: `https://example.com/${name}-generated.jpg`
});

const buildBlock = (overrides?: Omit<Partial<FoundationInfo>, 'hidden'>): FoundationInfo => ({
  title: { uk: createDocNode('Заголовок UK'), en: createDocNode('Title EN') },
  ourOrganisation: { uk: createDocNode('Організація UK'), en: createDocNode('Organisation EN') },
  ourName: { uk: createDocNode('Назва UK'), en: createDocNode('Name EN') },
  ourBelief: { uk: createDocNode('Переконання UK'), en: createDocNode('Belief EN') },
  image: buildImage('main'),
  ourMission: {
    title: { uk: createDocNode('Місія UK'), en: createDocNode('Mission EN') },
    smallImage: buildImage('small'),
    bigImage: buildImage('big'),
    list: [{ uk: createDocNode('Пункт UK'), en: createDocNode('Item EN') }]
  },
  hidden: false,
  ...overrides
});

describe('foundationAdapter', () => {
  describe('toContent', () => {
    it('maps block fields to header, paragraph and image content items', () => {
      const block = buildBlock();

      const result = foundationAdapter.toContent(block);

      expect(result).toEqual([
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        {
          id: 'ourOrganisation',
          type: CONTENT_TYPE.PARAGRAPH,
          value: block.ourOrganisation,
          label: 'Основний текст секції'
        },
        {
          id: 'ourName',
          type: CONTENT_TYPE.PARAGRAPH,
          value: block.ourName,
          label: 'Текст 1 абзацу'
        },
        {
          id: 'ourBelief',
          type: CONTENT_TYPE.PARAGRAPH,
          value: block.ourBelief,
          label: 'Текст 2 абзацу'
        },
        {
          id: 'image',
          type: CONTENT_TYPE.IMAGE,
          value: block.image,
          label: 'Основне зображення',
          aspectRatio: CROP_RATIOS.FUNDATION_PROFILE_SMALL,
          showCaption: false
        }
      ]);
    });
  });

  describe('fromContent', () => {
    it('extracts title, paragraphs and image from content items', () => {
      const block = buildBlock();
      const content = foundationAdapter.toContent(block);

      const result = foundationAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: block.title,
        ourOrganisation: block.ourOrganisation,
        ourName: block.ourName,
        ourBelief: block.ourBelief,
        image: block.image
      });
    });

    it('returns undefined fields when content is empty', () => {
      const block = buildBlock();

      const result = foundationAdapter.fromContent([], block);

      expect(result).toEqual({
        title: undefined,
        ourOrganisation: undefined,
        ourName: undefined,
        ourBelief: undefined,
        image: undefined
      });
    });

    it('returns only present fields when some content items are missing', () => {
      const block = buildBlock();
      const content = [
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        {
          id: 'image',
          type: CONTENT_TYPE.IMAGE,
          value: block.image,
          label: 'Основне зображення',
          aspectRatio: CROP_RATIOS.FUNDATION_PROFILE_SMALL,
          showCaption: false
        }
      ];

      const result = foundationAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: block.title,
        ourOrganisation: undefined,
        ourName: undefined,
        ourBelief: undefined,
        image: block.image
      });
    });
  });
});
