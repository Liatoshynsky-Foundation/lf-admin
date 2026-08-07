import type { BlockConfig } from '~/types/blocks/blockConfig';
import { CONTENT_TYPE } from '~/types/blocks/contentTypes';

export const sandboxBlockConfig: BlockConfig = {
  allowed: [
    { type: CONTENT_TYPE.HEADER, required: true, label: 'Заголовок' },
    { type: CONTENT_TYPE.PARAGRAPH, repeatable: true, label: 'Додати абзац' },
    { type: CONTENT_TYPE.LIST, repeatable: true, label: 'Додати список' }
  ]
};

export const descriptionListNoteConfig: BlockConfig = {
  allowed: [
    { type: CONTENT_TYPE.HEADER, required: true },
    { type: CONTENT_TYPE.PARAGRAPH, required: true },
    { type: CONTENT_TYPE.LIST, required: true },
    { type: CONTENT_TYPE.PARAGRAPH, required: true }
  ]
};

export const headerSectionListConfig: BlockConfig = {
  allowed: [
    { type: CONTENT_TYPE.HEADER, required: true },
    { type: CONTENT_TYPE.SECTION_LIST, required: true }
  ]
};
