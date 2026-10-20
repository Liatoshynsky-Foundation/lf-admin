import type { JSONContent } from '@tiptap/react';

export interface PublicationsIntroBlock {
    publicationsIntro: Record<'uk' | 'en', JSONContent>;
    publicationsOutro: Record<'uk' | 'en', JSONContent>;
}