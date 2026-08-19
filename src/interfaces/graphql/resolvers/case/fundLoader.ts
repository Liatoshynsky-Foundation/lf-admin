import DataLoader from 'dataloader';

import { Fund } from '~/src/domain/entities/Fund';
import { IFundRepository } from '~/src/domain/repositories/fundRepository';

type FundLoaderDeps = Readonly<{
  fundRepository: IFundRepository;
}>;

export const createFundLoader = ({ fundRepository }: FundLoaderDeps): DataLoader<string, Fund | null> =>
  new DataLoader<string, Fund | null>(async (fundIds) => {
    const funds = await fundRepository.findByIds(fundIds);
    const fundsById = new Map(funds.map((fund) => [fund.id, fund]));

    return fundIds.map((id) => fundsById.get(id) ?? null);
  });
