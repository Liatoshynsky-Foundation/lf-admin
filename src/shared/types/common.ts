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
