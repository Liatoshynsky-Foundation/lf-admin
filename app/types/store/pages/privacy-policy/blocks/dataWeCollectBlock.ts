import type { LocalizedJSON } from '~/types/common';

export type Item = {
  subtitle: LocalizedJSON;
  list: LocalizedJSON[];
};

export type ItemWithId = {
  id: string;
} & Item;

export type DataWeCollectBlock = {
  title: LocalizedJSON;
  sections: ItemWithId[];
  description: LocalizedJSON;
  note: LocalizedJSON;
};