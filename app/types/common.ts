export interface LocalizedString {
  uk: string;
  en: string;
}

export interface ImageBlock {
  src: string;
  alt: LocalizedString;
  caption: LocalizedString;
  isTmp?: boolean;
}

export type ImageType = {
  src: string;
  alt: { uk: string; en: string };
  caption: { uk: string; en: string };
  generatedSrc: string;
};

export interface QuoteBlock {
  text: LocalizedString;
  source: LocalizedString;
}

export type ProseTextNode = {
  type: 'text';
  text: string;
  marks?: { type: 'bold' | 'italic' }[];
};

export type ParagraphNode = {
  type: 'paragraph';
  content: ProseTextNode[];
};

export type HeadingNode = {
  type: 'heading';
  level: 1 | 2 | 3;
  content: ProseTextNode[];
};

export type ImageNode = {
  type: 'image';
  src: string;
  alt?: string;
};

export type ProseNode = ParagraphNode | HeadingNode | ImageNode;

export type ProseDoc = {
  type: 'doc';
  content: ProseNode[];
};

export type LocalizedProse = {
  uk: ProseDoc;
  en: ProseDoc;
};
