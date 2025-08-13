import { Paragraph } from '~/types/accordionBlocks';

export interface LiatoshynskyFoundationBlock {
  paragraphs: Paragraph[];
  mainText: string;
  image?: string;
  imageFileName?: string;
}
