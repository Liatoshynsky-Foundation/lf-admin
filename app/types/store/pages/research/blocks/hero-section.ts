import type { JSONContent } from '@tiptap/react';

export interface ResearchQuote {
  text?: Partial<Record<'uk' | 'en', JSONContent>>;
  source?: Partial<Record<'uk' | 'en', JSONContent>>;
}

export interface ResearchHeroBlock {
  title: Record<'uk' | 'en', string> | string;
  quote?: ResearchQuote;
}
