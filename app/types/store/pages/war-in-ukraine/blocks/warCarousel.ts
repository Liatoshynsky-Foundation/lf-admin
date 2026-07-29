import { CropRect } from '~/types/common';


export interface WarCarouselBlock {
  hidden: boolean | undefined;
  images?: Array<{
    id?: string | number;
    src: string;
    alt: Record<'uk' | 'en', string>;
    caption?: Record<'uk' | 'en', string>;
    crop?: { rect: CropRect } | null;
  }>;
}