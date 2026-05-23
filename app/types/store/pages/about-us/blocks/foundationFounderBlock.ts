import { ImageType, LocalizedJSON } from '~/types/common';

export type TeamMember = {
  photo: ImageType;
  name: LocalizedJSON;
  description: LocalizedJSON;
};

export type TeamMemberWithId = {
  id: string;
} & TeamMember;

export type FoundationFoundersBlock = {
  titleText: LocalizedJSON;
  listTitle: LocalizedJSON;
  members: TeamMember[];
};
