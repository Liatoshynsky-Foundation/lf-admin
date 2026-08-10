import DataLoader from 'dataloader';

import { Fond } from '~/src/domain/entities/Fond';
import { IFondRepository } from '~/src/domain/repositories/fondRepository';

type FondLoaderDeps = Readonly<{
  fondRepository: IFondRepository;
}>;

export const createFondLoader = ({ fondRepository }: FondLoaderDeps): DataLoader<string, Fond | null> =>
  new DataLoader<string, Fond | null>(async (fondIds) => {
    const fonds = await fondRepository.findByIds(fondIds);
    const fondsById = new Map(fonds.map((fond) => [fond.id, fond]));

    return fondIds.map((id) => fondsById.get(id) ?? null);
  });
