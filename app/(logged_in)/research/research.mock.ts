import seedData from './research.mock.data.json';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type ResearchWorkStatus = BaseContentStatuses;

export type ResearchWork = {
  id: string;
  author: string;
  bibliographicDescription: string;
  year: string;
  keywords: string;
  status: ResearchWorkStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

const isResearchWorkStatus = (value: string): value is ResearchWorkStatus =>
  Object.values(BaseContentStatuses).includes(value as BaseContentStatuses);

const normalizeStatus = (value: string): ResearchWorkStatus =>
  isResearchWorkStatus(value) ? value : BaseContentStatuses.Draft;

type ResearchWorkSeed = Omit<ResearchWork, 'status'> & { status: string };

const SEEDS = seedData as ResearchWorkSeed[];

export const RESEARCH_WORKS_MOCK_DATA: ResearchWork[] = SEEDS.map((item) => ({
  ...item,
  status: normalizeStatus(item.status)
}));