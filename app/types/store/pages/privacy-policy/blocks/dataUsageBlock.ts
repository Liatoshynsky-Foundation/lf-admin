import type { LocalizedJSON, WithHidden } from '~/types/common';

export type DataUsageItemWithId = {
  id: string;
} & LocalizedJSON;

export type DataUsageBlock = {
  title: LocalizedJSON;
  description: LocalizedJSON;
  list: DataUsageItemWithId[];
} & WithHidden;