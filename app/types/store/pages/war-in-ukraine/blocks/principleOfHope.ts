import { JSONContent } from '@tiptap/react';

export interface PrincipleOfHopeBlock {
  hidden: boolean | undefined;
  buttonText: Record<'uk' | 'en', string>;
  buttonLink: string;
  description: Record<'uk' | 'en', JSONContent>;
  buttons: Array<{
    shortText: Record<'uk' | 'en', string>;
    fullText: Record<'uk' | 'en', string>;
    link: string;
  }>;
}