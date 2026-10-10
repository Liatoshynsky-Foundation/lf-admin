import {
  blockToSection,
  isManagedPageSectionBlock,
  mergeBlocksOrderWithManagedSections,
  sectionsFromStore,
  sectionToBlock} from './pageSection.mapper';
import { SECTION_ITEM_TYPE } from './pageSection.types';
import { createPageSection, createSectionItem } from './pageSection.utils';
import { MANAGED_PAGE_SECTION_BLOCK_KIND } from '~/types/store/pages/managedPageSectionBlock';

describe('pageSection.mapper', () => {
  it('should map section to block and back using block id as section id', () => {
    const section = createPageSection();
    section.items = [createSectionItem(SECTION_ITEM_TYPE.PARAGRAPH)];

    const block = sectionToBlock(section);
    expect(block.kind).toBe(MANAGED_PAGE_SECTION_BLOCK_KIND);
    expect(isManagedPageSectionBlock(block)).toBe(true);

    const restored = blockToSection('section-block-id', block);
    expect(restored.id).toBe('section-block-id');
    expect(restored.items).toHaveLength(1);
  });

  it('should read managed sections from blocks order', () => {
    const section = createPageSection();
    const block = sectionToBlock(section);

    const blocks = {
      OurGoals: { title: { uk: {}, en: {} } },
      [section.id]: block
    };

    const sections = sectionsFromStore(['OurGoals', section.id], blocks);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.id).toBe(section.id);
  });

  it('should keep static blocks first when merging order', () => {
    const sectionA = createPageSection();
    const sectionB = createPageSection();
    const blocks = {
      IntroSection: {},
      [sectionA.id]: sectionToBlock(sectionA),
      [sectionB.id]: sectionToBlock(sectionB)
    };

    const order = mergeBlocksOrderWithManagedSections(['IntroSection', sectionB.id, sectionA.id], blocks, [
      sectionA.id,
      sectionB.id
    ]);

    expect(order).toEqual(['IntroSection', sectionA.id, sectionB.id]);
  });
});
