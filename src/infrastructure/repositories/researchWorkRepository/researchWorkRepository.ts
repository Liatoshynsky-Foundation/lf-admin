import { FilterQuery, Model } from 'mongoose';

import dbConnect from '../../db/connect';
import { createBaseRepository } from '../baseRepository/baseRepository';
import { buildBaseQuery, createToEntity } from '../helpers';
import { ResearchWork } from '~/src/domain/entities/ResearchWork';
import {
  CreateResearchWorkInput,
  IResearchWorkRepository,
  ResearchWorkFilters
} from '~/src/domain/repositories/researchWorkRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type DbResearchWork = {
  _id: { toString(): string };
  bibliographicDescription: ResearchWork['bibliographicDescription'];
  author: ResearchWork['author'];
  year: ResearchWork['year'];
  keywords?: ResearchWork['keywords'];
  pdfFile?: ResearchWork['pdfFile'];
  url?: ResearchWork['url'];
  status: ResearchWork['status'];
  publishedAt?: Date | string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ResearchWorkRepoDeps = Readonly<{
  ResearchWorkModel: Model<DbResearchWork>;
}>;

const toIsoStringOrNull = (value: Date | string | null | undefined): string | null => {
  if (value == null) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
};

const toEntity = (doc: DbResearchWork): ResearchWork => {
  const now = new Date().toISOString();
  const safeDoc = {
    ...doc,
    createdAt: doc.createdAt || now,
    updatedAt: doc.updatedAt || now
  };

  return createToEntity<ResearchWork, DbResearchWork>(safeDoc, {
    bibliographicDescription: safeDoc.bibliographicDescription,
    author: safeDoc.author,
    year: safeDoc.year,
    keywords: safeDoc.keywords,
    pdfFile: safeDoc.pdfFile ?? null,
    url: safeDoc.url ?? null,
    status: safeDoc.status ?? BaseContentStatuses.Hidden,
    publishedAt: toIsoStringOrNull(safeDoc.publishedAt)
  });
};

const RESEARCH_WORK_SEARCH_FIELDS = [
  'bibliographicDescription',
  'author',
  'year',
  'keywords'
] as const;

const buildResearchWorkQuery = (filters?: ResearchWorkFilters): FilterQuery<DbResearchWork> =>
  buildBaseQuery<DbResearchWork>({ ...filters, languages: undefined }, RESEARCH_WORK_SEARCH_FIELDS);

export const ResearchWorkRepository = ({
  ResearchWorkModel
}: ResearchWorkRepoDeps): IResearchWorkRepository => {
  const baseRepo = createBaseRepository<ResearchWork, DbResearchWork, ResearchWorkFilters>({
    model: ResearchWorkModel,
    toEntity,
    buildQuery: buildResearchWorkQuery,
    getDefaultSort: () => ({ author: 1, bibliographicDescription: 1 }),
    collation: { locale: 'uk', strength: 2 }
  });

  return {
    ...baseRepo,

    create: async (input: CreateResearchWorkInput): Promise<ResearchWork> => {
      await dbConnect();

      const newResearchWork = await new ResearchWorkModel(input as unknown as DbResearchWork).save();
      return toEntity(newResearchWork.toObject() as unknown as DbResearchWork);
    }
  };
};
