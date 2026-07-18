import { ImageType, ProseDoc } from '~/types/common';

export type MissionListItem = {
  uk: ProseDoc;
  en: ProseDoc;
};

export type MissionListItemWithId = {
  id: string;
} & MissionListItem;

export type OurMissionBlock = {
  title: MissionListItem;
  smallImage: ImageType;
  bigImage: ImageType;
  list: MissionListItem[];
  hidden?: boolean;
};
