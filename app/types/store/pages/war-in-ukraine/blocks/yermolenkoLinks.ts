import { JSONContent } from '@tiptap/react';

export interface YermolenkoLinksBlock {
  hidden: boolean | undefined;
  buttonText: Record<'uk' | 'en', string>;
  description: Record<'uk' | 'en', JSONContent>;
  buttons: Array<{
    shortText: Record<'uk' | 'en', string>;
    fullText: Record<'uk' | 'en', string>;
    link: string;
  }>;
}