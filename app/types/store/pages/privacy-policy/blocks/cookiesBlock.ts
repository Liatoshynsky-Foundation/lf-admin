import type { LocalizedJSON } from '~/types/common';

export type CookiesItemWithId = {
  id: string;
} & LocalizedJSON;

export type CookiesBlock = {
  title: LocalizedJSON;
  description: LocalizedJSON;
  list: CookiesItemWithId[];
  note: LocalizedJSON;
};
