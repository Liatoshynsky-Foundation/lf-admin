import { ImageType, LocalizedProse, LocalizedString } from '~/types/common';

export type TeamMember = {
  photo: ImageType;
  name: LocalizedString;
  description: LocalizedString;
};

export type TeamMemberWithId = {
  id: string;
} & TeamMember;

export type FoundationFoundersBlock = {
  titleText: LocalizedProse;
  listTitle: LocalizedString;
  members: TeamMember[];
};
