import { ImageType, LocalizedJSON, WithHidden } from '~/types/common';

export type TeamMember = {
  photo: Omit<ImageType, 'caption'>;
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
} & WithHidden;
