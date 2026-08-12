import { Model, Types } from 'mongoose';

import dbConnect from '../../db/connect';
import { createBaseRepository } from '../baseRepository/baseRepository';
import { buildBaseQuery, createToEntity, getBaseSort } from '../helpers';
import { Fond } from '~/src/domain/entities/Fond';
import { CreateFondInput, FondFilters, IFondRepository } from '~/src/domain/repositories/fondRepository';

export type DbFond = {
  _id: { toString(): string };
  fondNumber: Fond['fondNumber'];
  name: Fond['name'];
  documentCreationDate: Fond['documentCreationDate'];
  chronologicalBoundaries: Fond['chronologicalBoundaries'];
  organizationForm: Fond['organizationForm'];
  description: Fond['description'];
  status: Fond['status']
  casesCount: Fond['casesCount'];
  descriptionsCount: Fond['descriptionsCount'];
  createdAt: string;
  updatedAt: string;
}

type FondRepoDeps = Readonly<{
  FondModel: Model<DbFond>;
}>;

const toEntity = (doc: DbFond): Fond =>
  createToEntity<Fond, DbFond>(doc, {
    fondNumber: doc.fondNumber,
    name: doc.name,
    documentCreationDate: doc.documentCreationDate,
    chronologicalBoundaries: doc.chronologicalBoundaries,
    organizationForm: doc.organizationForm,
    description: doc.description,
    status: doc.status,
    casesCount: doc.casesCount ?? 0,
    descriptionsCount: doc.descriptionsCount ?? 0,
  });

export const FondRepository = ({ FondModel }: FondRepoDeps): IFondRepository => {
  const baseRepo = createBaseRepository<Fond, DbFond, FondFilters>({
    model: FondModel,
    toEntity,
    buildQuery: (filters) => buildBaseQuery(filters, ['name.uk', 'name.en']),
    getDefaultSort: getBaseSort
  });

  return {
    ...baseRepo,
    
    create: async (input: CreateFondInput): Promise<Fond> => {
      await dbConnect();

      const fondData = {
        ...input,
      };

      const newFond = await new FondModel(fondData).save();
      return toEntity(newFond.toObject() as unknown as DbFond);
    },

    findByFondNumber: async (fondNumber: Fond['fondNumber']): Promise<Fond | null> => {
      await dbConnect();

      const existing = await FondModel.findOne({ fondNumber });

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