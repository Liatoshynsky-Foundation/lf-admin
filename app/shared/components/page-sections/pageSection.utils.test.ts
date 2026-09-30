import { SECTION_ITEM_TYPE } from './pageSection.types';
import { createPageSection, createSectionItem, sectionOrdinalTitle } from './pageSection.utils';

describe('pageSection.utils', () => {
  it('should name the first sections with Ukrainian ordinals and fall back to a number', () => {
    expect(sectionOrdinalTitle(0)).toBe('Перша секція');
    expect(sectionOrdinalTitle(1)).toBe('Друга секція');
    expect(sectionOrdinalTitle(10)).toBe('Секція 11');
  });

  it('should create an empty section and an empty content item', () => {
    const section = createPageSection();
    const item = createSectionItem(SECTION_ITEM_TYPE.PARAGRAPH);

    expect(section.items).toEqual([]);
    expect(section.title.uk).toEqual({ type: 'doc', content: [] });
    expect(section.title.en).toEqual({ type: 'doc', content: [] });
    expect(item.type).toBe(SECTION_ITEM_TYPE.PARAGRAPH);
    expect(item.value.uk).toEqual({ type: 'doc', content: [] });
    expect(section.id).not.toBe(item.id);
  });
});
