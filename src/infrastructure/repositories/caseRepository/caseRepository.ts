import { FilterQuery, Model } from 'mongoose';

import dbConnect from '../../db/connect';
import { createBaseRepository } from '../baseRepository/baseRepository';
import { buildBaseQuery, combineConditions, createToEntity, getBaseSort } from '../helpers';
import { Case } from '~/src/domain/entities/Case';
import { CaseFilters, CreateCaseInput, ICaseRepository } from '~/src/domain/repositories/caseRepository';

export type DbCase = {
  _id: { toString(): string };
  fundId: Case['fundId'];
  descriptionNumber: Case['descriptionNumber'];
  caseNumber: Case['caseNumber'];
  caseName: Case['caseName'];
  caseDate: Case['caseDate'];
  sheetsNumber: Case['sheetsNumber'];
  caseDescriptions: Case['caseDescriptions'];
  detailedCaseDescription: Case['detailedCaseDescription'];
  pdfFile: Case['pdfFile'];
  status: Case['status'];
  createdAt: string;
  updatedAt: string;
};

type CaseRepoDeps = Readonly<{
  CaseModel: Model<DbCase>;
}>;

const toEntity = (doc: DbCase): Case =>
  createToEntity<Case, DbCase>(doc, {
    fundId: doc.fundId?.toString ? doc.fundId.toString() : doc.fundId,
    descriptionNumber: doc.descriptionNumber,
    caseNumber: doc.caseNumber,
    caseName: doc.caseName,
    caseDate: doc.caseDate,
    sheetsNumber: doc.sheetsNumber,
    caseDescriptions: doc.caseDescriptions,
    detailedCaseDescription: doc.detailedCaseDescription ?? undefined,
    pdfFile: doc.pdfFile ?? undefined,
    status: doc.status
  });

const buildCaseQuery = (filters?: CaseFilters): FilterQuery<DbCase> =>
  combineConditions<DbCase>([
    buildBaseQuery<DbCase>(filters, ['caseName.uk', 'caseName.en'], 'caseName'),
    filters?.fundId ? ({ fundId: filters.fundId } as FilterQuery<DbCase>) : null
  ]);

export const CaseRepository = ({ CaseModel }: CaseRepoDeps): ICaseRepository => {
  const baseRepo = createBaseRepository<Case, DbCase, CaseFilters>({
    model: CaseModel,
    toEntity,
    buildQuery: buildCaseQuery,
    getDefaultSort: getBaseSort
  });

  return {
    ...baseRepo,

    create: async (input: CreateCaseInput): Promise<Case> => {
      await dbConnect();

      const newCase = await new CaseModel(input as unknown as DbCase).save();
      return toEntity(newCase.toObject() as unknown as DbCase);
    },

    findByFundAndNumbers: async (
      fundId: Case['fundId'],
      descriptionNumber: Case['descriptionNumber'],
      caseNumber: Case['caseNumber']
    ): Promise<Case | null> => {
      await dbConnect();

      const existing = await CaseModel.findOne({ fundId, descriptionNumber, caseNumber });

      if (!existing) {
        return null;
      }
      return toEntity(existing.toObject() as unknown as DbCase);
    },

    countDistinctDescriptionNumbers: async (fundId: Case['fundId']): Promise<number> => {
      await dbConnect();

      const distinctDescriptionNumbers = await CaseModel.distinct('descriptionNumber', { fundId });
      return distinctDescriptionNumbers.length;
    }
  };
};
