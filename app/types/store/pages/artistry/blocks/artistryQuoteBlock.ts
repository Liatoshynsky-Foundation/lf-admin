import { JSONContent } from '@tiptap/react';

export interface TitleWithQuoteBlock {
  title: Record<'uk' | 'en', JSONContent>;
  quoteText: Record<'uk' | 'en', JSONContent>;
  sourceText: Record<'uk' | 'en', JSONContent>;
}

export type ArtystryQuoteBlock = TitleWithQuoteBlock;