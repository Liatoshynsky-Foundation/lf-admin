import type { LocalizedJSON } from '~/types/common';

export type DataUsageItem = {
  title: LocalizedJSON;
  description: LocalizedJSON;
};

export type DataUsageItemWithId = {
  id: string;
} & DataUsageItem;

export type DataUsageBlock = {
  title: LocalizedJSON;
  description: LocalizedJSON;
  list: LocalizedJSON[];
};