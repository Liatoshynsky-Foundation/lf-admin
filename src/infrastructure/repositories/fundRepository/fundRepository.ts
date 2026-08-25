import { Model, Types } from 'mongoose';

import dbConnect from '../../db/connect';
import { createBaseRepository } from '../baseRepository/baseRepository';
import { buildBaseQuery, createToEntity, getBaseSort } from '../helpers';
import { Fund } from '~/src/domain/entities/Fund';
import {
  CreateFundInput,
  FundFilters,
  IFundRepository,
  UpdateFundInput
} from '~/src/domain/repositories/fundRepository';
import logger from '~/src/middleware/logger/logger';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type DbFund = {
  _id: { toString(): string };
  id: number;
  title: { uk: string; en: string };
  numberOfDescriptions: number;
  numberOfCases: number;
  organizationForm?: { uk: string; en: string };
  documentCreationDate: string;
  chronologicalBoundaries?: string;
  characterAndContent?: {
    uk: Record<string, unknown>;
    en: Record<string, unknown>;
  };
  status?: string;
  createdAt: string;
  updatedAt: string;
};

type FundRepoDeps = Readonly<{
  FundModel: Model<DbFund>;
}>;

const VALID_STATUS_VALUES: string[] = Object.values(BaseContentStatuses);

const resolveStatus = (dbStatus?: string): BaseContentStatuses => {
  if (dbStatus && VALID_STATUS_VALUES.includes(dbStatus)) {
    return dbStatus as BaseContentStatuses;
  }
  return BaseContentStatuses.Hidden;
};

const parseJsonContent = (content?: string | null): Record<string, unknown> => {
  if (!content) return {};

  try {
    const parsed = JSON.parse(content) as unknown;
    const isPlainObject = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
    return isPlainObject ? (parsed as Record<string, unknown>) : {};
  } catch (error) {
    logger.warn('Error parsing JSON content:', error);
    return {};
  }
};

const toEntity = (doc: DbFund): Fund => {
  const safeDoc = {
    ...doc,
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString()
  };

  return createToEntity<Fund, DbFund>(safeDoc, {
    fundNumber: safeDoc.id,
    name: safeDoc.title,
    documentCreationDate: { uk: safeDoc.documentCreationDate || '', en: safeDoc.documentCreationDate || '' },
    chronologicalBoundaries: safeDoc.chronologicalBoundaries
      ? { uk: safeDoc.chronologicalBoundaries, en: safeDoc.chronologicalBoundaries }
      : undefined,
    organizationForm: safeDoc.organizationForm,
    description: safeDoc.characterAndContent as unknown as Fund['description'],
    status: resolveStatus(safeDoc.status),
    casesCount: safeDoc.numberOfCases ?? 0,
    descriptionsCount: safeDoc.numberOfDescriptions ?? 0
  });
};

export const FundRepository = ({ FundModel }: FundRepoDeps): IFundRepository => {
  const baseRepo = createBaseRepository<Fund, DbFund, FundFilters>({
    model: FundModel,
    toEntity,
    buildQuery: (filters) => {
      const query = buildBaseQuery(filters, ['title.uk', 'title.en']);
      if (filters?.statuses && filters.statuses.length > 0) {
        query.status = { $in: filters.statuses };
      }
      return query;
    },
    getDefaultSort: getBaseSort
  });

  return {
    ...baseRepo,

    create: async (input: CreateFundInput): Promise<Fund> => {
      await dbConnect();
      const dbData = {
        id: input.fundNumber,
        title: input.name,
        documentCreationDate: input.documentCreationDate.uk,
        chronologicalBoundaries: input.chronologicalBoundaries?.uk,
        organizationForm: input.organizationForm,
        characterAndContent: input.description
          ? {
            uk: parseJsonContent(input.description.uk),
            en: parseJsonContent(input.description.en)
          }
          : undefined,
        status: input.status || BaseContentStatuses.Hidden,
        numberOfCases: 0,
        numberOfDescriptions: 0
      };

      const newFund = await new FundModel(dbData).save();
      return toEntity(newFund.toObject() as unknown as DbFund);
    },

    update: async (id: string, input: UpdateFundInput): Promise<Fund | null> => {
      await dbConnect();

      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const updateInput = input as UpdateFundInput & {
        casesCount?: number;
        descriptionsCount?: number;
      };

      const updateData: Record<string, unknown> = {
        updatedAt: new Date().toISOString()
      };

      if (input.name) {
        updateData.title = input.name;
      }

      if (input.documentCreationDate) {
        updateData.documentCreationDate = input.documentCreationDate.uk;
      }

      if (input.chronologicalBoundaries !== undefined) {
        updateData.chronologicalBoundaries = input.chronologicalBoundaries?.uk;
      }

      if (input.organizationForm !== undefined) {
        updateData.organizationForm = input.organizationForm;
      }

      if (input.description !== undefined) {
        updateData.characterAndContent = {
          uk: parseJsonContent(input.description.uk),
          en: parseJsonContent(input.description.en)
        };
      }

      if (input.status !== undefined) {
        updateData.status = input.status;
      }

      if (updateInput.casesCount !== undefined) {
        updateData.numberOfCases = updateInput.casesCount;
      }

      if (updateInput.descriptionsCount !== undefined) {
        updateData.numberOfDescriptions = updateInput.descriptionsCount;
      }

      const updated = await FundModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      }).lean<DbFund>();

      return updated ? toEntity(updated) : null;
    },

    findByFundNumber: async (fundNumber: Fund['fundNumber']): Promise<Fund | null> => {
      await dbConnect();

      const existing = await FundModel.findOne({ id: fundNumber });

      if (!existing) {
        return null;
      }
      return toEntity(existing.toObject() as unknown as DbFund);
    },

    findByIds: async (ids: readonly string[]): Promise<Fund[]> => {
      await dbConnect();

      const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
      if (!validIds.length) {
        return [];
      }

      const docs = await FundModel.find({ _id: { $in: validIds } }).lean<DbFund[]>();
      return docs.map(toEntity);
    }
  };
};
