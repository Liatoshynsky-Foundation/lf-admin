import type { LocalizedProse, LocalizedString } from '~/types/common';

export type GoalItem = {
  title: LocalizedString;
  description: LocalizedProse;
};

export type GoalItemWithId = {
  id: string;
} & GoalItem;

export type OurGoalsBlock = {
  title: LocalizedString;
  goals: GoalItemWithId[];
};
