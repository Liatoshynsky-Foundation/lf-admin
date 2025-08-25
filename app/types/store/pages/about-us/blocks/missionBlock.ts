import { ProseDoc } from './liatoshynskyFoundationBlock';

export type MissionListItem = {
  uk: ProseDoc;
  en: ProseDoc;
};

export type MissionListItemWithId = {
  id: string;
} & MissionListItem;

export type MissionImageType = {
  src: string;
  alt: { uk: string; en: string };
  caption: { uk: string; en: string };
  generatedSrc: string;
};

export type OurMissionBlock = {
  title: { uk: string; en: string };
  smallImage: MissionImageType;
  bigImage: MissionImageType;
  list: MissionListItem[];
};
