import { Model, Types } from 'mongoose';

import dbConnect from '../../db/connect';
import { createBaseRepository } from '../baseRepository/baseRepository';
import { buildBaseQuery, createToEntity, getBaseSort } from '../helpers';
import { Fond } from '~/src/domain/entities/Fond';
import { CreateFondInput, FondFilters, IFondRepository, UpdateFondInput } from '~/src/domain/repositories/fondRepository';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type DbFond = {
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

type FondRepoDeps = Readonly<{
  FondModel: Model<DbFond>;
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
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content) as unknown;
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return {};
};

const toEntity = (doc: DbFond): Fond => {
  const safeDoc = {
    ...doc,
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString()
  };

  return createToEntity<Fond, DbFond>(safeDoc, {
    fondNumber: safeDoc.id,
    name: safeDoc.title,
    documentCreationDate: { uk: safeDoc.documentCreationDate || '', en: safeDoc.documentCreationDate || '' },
    chronologicalBoundaries: safeDoc.chronologicalBoundaries
      ? { uk: safeDoc.chronologicalBoundaries, en: safeDoc.chronologicalBoundaries }
      : undefined,
    organizationForm: safeDoc.organizationForm,
    description: safeDoc.characterAndContent as unknown as Fond['description'],
    status: resolveStatus(safeDoc.status),
    casesCount: safeDoc.numberOfCases ?? 0,
    descriptionsCount: safeDoc.numberOfDescriptions ?? 0
  });
};

export const FondRepository = ({ FondModel }: FondRepoDeps): IFondRepository => {
  const baseRepo = createBaseRepository<Fond, DbFond, FondFilters>({
    model: FondModel,
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
    
    create: async (input: CreateFondInput): Promise<Fond> => {
      await dbConnect();
      const dbData = {
        id: input.fondNumber,
        title: input.name,
        documentCreationDate: input.documentCreationDate.uk,
        chronologicalBoundaries: input.chronologicalBoundaries?.uk,
        organizationForm: input.organizationForm,
        characterAndContent: input.description ? {
          uk: parseJsonContent(input.description.uk),
          en: parseJsonContent(input.description.en)
        } : undefined,
        status: input.status || BaseContentStatuses.Hidden,
        numberOfCases: 0,
        numberOfDescriptions: 0
      };

      const newFond = await new FondModel(dbData).save();
      return toEntity(newFond.toObject() as unknown as DbFond);
    },

    update: async (id: string, input: UpdateFondInput): Promise<Fond | null> => {
      await dbConnect();

      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const updateInput = input as UpdateFondInput & {
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

      const updated = await FondModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      }).lean<DbFond>();

      return updated ? toEntity(updated) : null;
    },

    findByFondNumber: async (fondNumber: Fond['fondNumber']): Promise<Fond | null> => {
      await dbConnect();

      const existing = await FondModel.findOne({ id: fondNumber });

      if (!existing) {
        return null;
      }
      return toEntity(existing.toObject() as unknown as DbFond);
    },

    findByIds: async (ids: readonly string[]): Promise<Fond[]> => {
      await dbConnect();

      const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
      if (!validIds.length) {
        return [];
      }

      const docs = await FondModel.find({ _id: { $in: validIds } }).lean<DbFond[]>();
      return docs.map(toEntity);
    }
  };
};
