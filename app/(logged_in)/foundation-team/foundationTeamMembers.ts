import { JSONContent } from '@tiptap/react';

import { hasMemberImage } from '~/lib/utils/hasMemberImage';
import { isProseDoc, proseToText, textToProse } from '~/lib/utils/prose';
import { LocalizedJSON, ProseDoc } from '~/types/common';
import { TeamMember, TeamMemberWithId } from '~/types/store/pages/about-us/blocks/foundationFounderBlock';

type LocalizedProseInput = {
  uk?: JSONContent | string | null;
  en?: JSONContent | string | null;
};

const isProseEmpty = (value: unknown): boolean => !proseToText(value as ProseDoc)?.trim();

export const createEmptyLocalizedProse = (): LocalizedJSON => ({
  uk: textToProse(''),
  en: textToProse('')
});

export const normalizeProseValue = (value: unknown): ProseDoc => {
  if (typeof value === 'string') return textToProse(value);
  if (isProseDoc(value) && Array.isArray(value.content)) return value;
  return textToProse('');
};

export const normalizeLocalizedProse = (value?: LocalizedProseInput | null): LocalizedJSON => ({
  uk: normalizeProseValue(value?.uk),
  en: normalizeProseValue(value?.en)
});

export const isEmptyTeamMember = (member: TeamMember | TeamMemberWithId): boolean => {
  if (hasMemberImage(member.photo)) return false;

  return (
    isProseEmpty(member.name?.uk) &&
    isProseEmpty(member.name?.en) &&
    isProseEmpty(member.description?.uk) &&
    isProseEmpty(member.description?.en)
  );
};

export const normalizeTeamMember = <T extends TeamMember | TeamMemberWithId>(member: T): T =>
  ({
    ...member,
    name: normalizeLocalizedProse(member.name),
    description: normalizeLocalizedProse(member.description),
    photo: {
      ...member.photo,
      src: member.photo?.src ?? '',
      generatedSrc: member.photo?.generatedSrc ?? '',
      alt: normalizeLocalizedProse(member.photo?.alt)
    }
  }) as T;

export const prepareTeamMembersForSave = <T extends TeamMember | TeamMemberWithId>(
  members: T[]
): { members: T[]; removedEmptyCount: number } => {
  const withoutGhosts = members.filter((member) => !isEmptyTeamMember(member));
  const normalized = withoutGhosts.map((member) => normalizeTeamMember(member));

  return {
    members: normalized,
    removedEmptyCount: members.length - withoutGhosts.length
  };
};
