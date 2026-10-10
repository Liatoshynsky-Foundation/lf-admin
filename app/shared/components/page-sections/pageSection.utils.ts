import { type PageSection, SECTION_ITEM_TYPE, type SectionItem, type SectionItemType } from './pageSection.types';
import { generateUniqueId } from '~/lib/utils/generateUniqueId';
import { emptyLocalizedJSON } from '~/lib/utils/localizedJson';

const SECTION_ORDINALS = [
  'Перша',
  'Друга',
  'Третя',
  'Четверта',
  'П\'ята',
  'Шоста',
  'Сьома',
  'Восьма',
  'Дев\'ята',
  'Десята'
] as const;

export const SECTION_ITEM_LABEL: Record<SectionItemType, string> = {
  [SECTION_ITEM_TYPE.SUBTITLE]: 'Підзаголовок',
  [SECTION_ITEM_TYPE.PARAGRAPH]: 'Абзац',
  [SECTION_ITEM_TYPE.BULLET]: 'Елемент маркованого списку'
};

export const sectionOrdinalTitle = (index: number): string => {
  const ordinal = SECTION_ORDINALS[index];
  return ordinal ? `${ordinal} секція` : `Секція ${index + 1}`;
};

export const createSectionItem = (type: SectionItemType): SectionItem => ({
  id: generateUniqueId(),
  type,
  value: emptyLocalizedJSON()
});

export const createPageSection = (): PageSection => ({
  id: generateUniqueId(),
  title: emptyLocalizedJSON(),
  items: []
});
