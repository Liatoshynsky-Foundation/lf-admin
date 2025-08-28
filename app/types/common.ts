export interface LocalizedString {
  uk: string;
  en: string;
}

export interface ImageBlock {
  src: string;
  alt: LocalizedString;
  caption: LocalizedString;
  generatedSrc: string;
}

export interface QuoteBlock {
  text: LocalizedString;
  source: LocalizedString;
}
