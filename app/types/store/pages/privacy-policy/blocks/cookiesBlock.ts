import type { LocalizedJSON, ProseDoc } from '~/types/common';

export type CookiesItem = {
  uk: ProseDoc;
  en: ProseDoc;
};

export type CookiesItemWithId = {
  id: string;
} & CookiesItem;

export type CookiesBlock = {
  title: LocalizedJSON;
  description: LocalizedJSON;
  list: LocalizedJSON[];
  note: LocalizedJSON;
};