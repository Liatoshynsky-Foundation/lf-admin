import type { LocalizedJSON } from '~/types/common';

export type Item = {
  title: LocalizedJSON;
  description: LocalizedJSON;
};

export type ItemWithId = {
  id: string;
} & Item;

export type DataUsageBlock = {
  title: LocalizedJSON;
  description: LocalizedJSON;
  list: LocalizedJSON[];
};