import { SECTION_ITEM_TYPE, type SectionItemType } from '~/shared/components/page-sections/pageSection.types';

export const PAGE_SECTION_ADD_ACTIONS: Array<{ type: SectionItemType; label: string }> = [
  { type: SECTION_ITEM_TYPE.SUBTITLE, label: 'Додати підзаголовок' },
  { type: SECTION_ITEM_TYPE.PARAGRAPH, label: 'Додати абзац' },
  { type: SECTION_ITEM_TYPE.BULLET, label: 'Додати елемент маркованого списку' }
];
