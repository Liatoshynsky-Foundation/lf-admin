import type { LocalizedJSON } from '~/types/common';

export type GoalItem = {
  title: LocalizedJSON;
  description: LocalizedJSON;
};

export type GoalItemWithId = {
  id: string;
} & GoalItem;

export type OurGoalsBlock = {
  title: LocalizedJSON;
  goals: GoalItemWithId[];
};
