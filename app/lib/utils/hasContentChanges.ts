import { Block } from '@blocknote/core';

import { LocalizedEditorState } from '~/constants/publications';
import { isContentEmpty } from '~/shared/components/content-editor';

const normalizeBlocks = (blocks?: Block[]) => (isContentEmpty(blocks) ? [] : (blocks ?? []));

const normalizeLocalizedContent = (content: LocalizedEditorState) => ({
  uk: normalizeBlocks(content.uk?.content.blocks),
  en: normalizeBlocks(content.en?.content.blocks)
});

export const hasContentChanges = (current: LocalizedEditorState, initial: LocalizedEditorState) =>
  JSON.stringify(normalizeLocalizedContent(current)) !== JSON.stringify(normalizeLocalizedContent(initial));
