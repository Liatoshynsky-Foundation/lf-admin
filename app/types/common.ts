import { ErrorMessage } from '~/interfaces/error';

export interface LocalizedString {
  uk: string;
  en: string;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropResult {
  rect: CropRect;
}

export interface ImageBlock {
  src: string;
  alt: LocalizedString;
  caption: LocalizedString;
  isTmp?: boolean;
  crop?: CropResult | null;
}

export type ImageType = {
  src: string;
  alt: { uk: string; en: string };
  caption: { uk: string; en: string };
  generatedSrc: string;
  crop?: CropResult | null;
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

interface IWrapper {
  children: React.ReactNode;
}

export type Wrapper = Readonly<IWrapper>;

export type Result<T> = { ok: true; value: T } | { ok: false; error: ErrorMessage };

export const UnwrapResult = <T>(r: Result<T>): T => {
  if (!r.ok) {
    throw new Error(r.error.Error());
  }
  return r.value;
};

export const WrapSuccess = <T>(value: T): Result<T> => ({ ok: true, value });
export const WrapError = <T>(err: ErrorMessage): Result<T> => ({ ok: false, error: err });

export const isSuccess = <T>(r: Result<T>): r is { ok: true; value: T } => r.ok;
export const isError = <T>(r: Result<T>): r is { ok: false; error: ErrorMessage } => !r.ok;
