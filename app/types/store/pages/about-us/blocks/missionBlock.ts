import { ImageType, ProseDoc } from '~/types/common';

export type MissionListItem = {
  uk: ProseDoc;
  en: ProseDoc;
};

export type MissionListItemWithId = {
  id: string;
} & MissionListItem;

export type OurMissionBlock = {
  title: { uk: string; en: string };
  smallImage: ImageType;
  bigImage: ImageType;
  list: MissionListItem[];
};
