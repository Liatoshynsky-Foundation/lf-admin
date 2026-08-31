import { FilterQuery, Model } from 'mongoose';

import dbConnect from '../../db/connect';
import { createBaseRepository } from '../baseRepository/baseRepository';
import { buildBaseQuery, combineConditions, createToEntity, getBaseSort } from '../helpers';
import { Case } from '~/src/domain/entities/Case';
import { CaseFilters, CreateCaseInput, ICaseRepository } from '~/src/domain/repositories/caseRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

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
  order: Case['order'];
  status: Case['status'];
  createdAt: string;
  updatedAt: string;
};

type CaseRepoDeps = Readonly<{
  CaseModel: Model<DbCase>;
}>;

const getNumberFromCipher = (cipher: string | undefined, pattern: RegExp): number | undefined => {
  const match = cipher?.match(pattern);
  return match ? Number(match[1]) : undefined;
};

const toEntity = (doc: DbCase): Case => {
  const now = new Date().toISOString();
  const safeDoc = {
    ...doc,
    createdAt: doc.createdAt || now,
    updatedAt: doc.updatedAt || now
  };
  const legacyCipher = (doc as DbCase & { cipher?: string }).cipher;
  const descriptionNumber =
    doc.descriptionNumber ?? getNumberFromCipher(legacyCipher, /оп\.\s*(\d+)/i) ?? 1;
  const caseNumber = doc.caseNumber ?? getNumberFromCipher(legacyCipher, /спр\.\s*(\d+)/i) ?? 1;

  return createToEntity<Case, DbCase>(safeDoc, {
    fundId: safeDoc.fundId?.toString ? safeDoc.fundId.toString() : safeDoc.fundId,
    descriptionNumber,
    caseNumber,
    caseName: safeDoc.caseName,
    caseDate: safeDoc.caseDate,
    sheetsNumber: safeDoc.sheetsNumber,
    caseDescriptions: safeDoc.caseDescriptions,
    detailedCaseDescription: safeDoc.detailedCaseDescription,
    pdfFile: safeDoc.pdfFile,
    status: safeDoc.status ?? BaseContentStatuses.Hidden,
    order: safeDoc.order ?? 0
  });
};

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

      const lastCase = await CaseModel.findOne({ fundId: input.fundId }).sort({ order: -1 }).lean();
      const nextOrder = input.order && input.order > 0 ? input.order : (lastCase?.order ?? 0) + 1;
      const newCase = await new CaseModel({ ...input, order: nextOrder } as unknown as DbCase).save();
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
