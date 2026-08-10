import { JSONContent } from '@tiptap/react';

export interface WarInfoBlock {
  title: Record<'uk' | 'en', string>;
  description: Record<'uk' | 'en', JSONContent>;
}