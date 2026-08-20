import { Case } from '~/src/domain/entities/Case';
import { GraphQLContext } from '~/src/shared/types/container/types';

export const formatCipher = (fundNumber: number, descriptionNumber: number, caseNumber: number): string =>
  `Ф. ${fundNumber}, оп. ${descriptionNumber}, спр. ${caseNumber}`;

export const CaseType = {
  cipher: async (parent: Case, _args: unknown, context: GraphQLContext): Promise<string> => {
    const { fundLoader } = context.requestContainer.cradle;
    const fund = await fundLoader.load(parent.fundId);

    return formatCipher(fund?.fundNumber ?? 0, parent.descriptionNumber, parent.caseNumber);
  }
};
