import { ourGoalsAdapter } from './our-goals.adapter';
import { createDocNode } from '~/__mocks__/utils';
import { CONTENT_TYPE } from '~/types/blocks/contentTypes';
import type { OurGoalsBlock } from '~/types/store/pages/about-us/blocks/ourGoalsBlock';

const buildBlock = (overrides?: Omit<Partial<OurGoalsBlock>, 'hidden'>): OurGoalsBlock => ({
  title: { uk: createDocNode('Заголовок UK'), en: createDocNode('Title EN') },
  goals: [
    {
      id: 'goal-1',
      title: { uk: createDocNode('Ціль 1'), en: createDocNode('Goal 1') },
      description: { uk: createDocNode('Опис 1'), en: createDocNode('Description 1') }
    },
    {
      id: 'goal-2',
      title: { uk: createDocNode('Ціль 2'), en: createDocNode('Goal 2') },
      description: { uk: createDocNode('Опис 2'), en: createDocNode('Description 2') }
    }
  ],
  hidden: false,
  ...overrides
});

describe('ourGoalsAdapter', () => {
  describe('toContent', () => {
    it('maps block title and goals to header and section-list content items', () => {
      const block = buildBlock();

      const result = ourGoalsAdapter.toContent(block);

      expect(result).toEqual([
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        {
          id: 'goals',
          type: CONTENT_TYPE.SECTION_LIST,
          items: block.goals,
          label: 'Пункти секції:'
        }
      ]);
    });

    it('falls back to an empty list when block.goals is undefined', () => {
      const block = buildBlock({ goals: undefined as unknown as OurGoalsBlock['goals'] });

      const result = ourGoalsAdapter.toContent(block);

      expect(result).toEqual([
        { id: 'title', type: CONTENT_TYPE.HEADER, title: block.title },
        {
          id: 'goals',
          type: CONTENT_TYPE.SECTION_LIST,
          items: [],
          label: 'Пункти секції:'
        }
      ]);
    });
  });

  describe('fromContent', () => {
    it('extracts title and goals from content items', () => {
      const block = buildBlock();
      const content = ourGoalsAdapter.toContent(block);

      const result = ourGoalsAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: block.title,
        goals: block.goals
      });
    });

    it('returns undefined fields when content is empty', () => {
      const block = buildBlock();

      const result = ourGoalsAdapter.fromContent([], block);

      expect(result).toEqual({
        title: undefined,
        goals: undefined
      });
    });

    it('returns only present fields when some content items are missing', () => {
      const block = buildBlock();
      const content = [{ id: 'title', type: CONTENT_TYPE.HEADER, title: block.title }];

      const result = ourGoalsAdapter.fromContent(content, block);

      expect(result).toEqual({
        title: block.title,
        goals: undefined
      });
    });
  });
});
