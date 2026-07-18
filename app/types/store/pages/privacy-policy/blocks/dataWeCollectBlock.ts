import type { LocalizedJSON } from '~/types/common';

export type DataWeCollectItem = {
  subtitle: LocalizedJSON;
  list: LocalizedJSON[];
};

export type DataWeCollectItemWithId = {
  id: string;
} & DataWeCollectItem;

export type DataWeCollectBlock = {
  title: LocalizedJSON;
  sections: DataWeCollectItemWithId[];
  description: LocalizedJSON;
  note: LocalizedJSON;
  hidden?: boolean;
};
