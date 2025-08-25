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

export type ImageType = {
  src: string;
  alt: { uk: string; en: string };
  caption: { uk: string; en: string };
  generatedSrc: string;
};

export type FoundationInfo = {
  ourOrganisation: Record<'uk' | 'en', ProseDoc>;
  ourName: Record<'uk' | 'en', ProseDoc>;
  ourBelief: Record<'uk' | 'en', ProseDoc>;
  image: ImageType;
  ourMission: {
    title: Record<'uk' | 'en', string>;
    smallImage: ImageType;
    bigImage: ImageType;
    list: Record<'uk' | 'en', ProseDoc>[];
  };
};
