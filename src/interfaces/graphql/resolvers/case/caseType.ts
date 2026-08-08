import { Case } from '~/src/domain/entities/Case';
import { GraphQLContext } from '~/src/shared/types/container/types';

export const formatCipher = (fondNumber: number, descriptionNumber: number, caseNumber: number): string =>
  `Ф. ${fondNumber}, оп. ${descriptionNumber}, спр. ${caseNumber}`;

export const CaseType = {
  cipher: async (parent: Case, _args: unknown, context: GraphQLContext): Promise<string> => {
    const { fondLoader } = context.requestContainer.cradle;
    const fond = await fondLoader.load(parent.fondId);

    return formatCipher(fond?.fondNumber ?? 0, parent.descriptionNumber, parent.caseNumber);
  }
};
