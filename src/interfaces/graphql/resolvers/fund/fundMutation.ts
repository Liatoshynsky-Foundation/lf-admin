import { GraphQLError } from 'graphql';

import { FundErrorCodes, FundErrors, graphqlErrors } from '~/constants/errors';
import { Fund } from '~/src/domain/entities/Fund';
import { CreateFundInput, UpdateFundInput } from '~/src/domain/repositories/fundRepository';
import { GraphQLContext } from '~/src/shared/types/container/types';
import { zFundSchema, zFundUpdateSchema } from '~/src/validators/fund.schema';
import { BaseContentStatuses } from '~/types/enums/common.enums';

export type CreateFundGQLInput = Omit<CreateFundInput, 'status'> & { status?: Fund['status'] };
export type UpdateFundGQLInput = UpdateFundInput;

type CreateFundArgs = { input: CreateFundGQLInput };
type UpdateFundArgs = { id: string; input: UpdateFundGQLInput };
type DeleteFundArgs = { id: string; };

const assertAuthenticated = (context: GraphQLContext) => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};

const isTipTapDoc = (value: unknown): value is { type: 'doc'; content?: unknown } =>
  typeof value === 'object' && value !== null && (value as { type?: unknown }).type === 'doc';

const extractTipTapText = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map(extractTipTapText).join('');
  }

  if (!value || typeof value !== 'object') return '';

  const node = value as { type?: unknown; text?: unknown; content?: unknown };
  if (typeof node.text === 'string') return node.text;

  const contentText = Array.isArray(node.content) ? extractTipTapText(node.content) : '';

  return node.type === 'paragraph' ? `${contentText}\n` : contentText;
};

const normalizeDescriptionTextForValidation = (value: string): string => {
  try {
    const parsedValue = JSON.parse(value) as unknown;
    return isTipTapDoc(parsedValue) ? extractTipTapText(parsedValue).trim() : value;
  } catch {
    return value;
  }
};

const normalizeDescriptionForValidation = (
  description?: CreateFundInput['description']
): CreateFundInput['description'] =>
  description
    ? {
      uk: normalizeDescriptionTextForValidation(description.uk),
      en: normalizeDescriptionTextForValidation(description.en)
    }
    : undefined;

const normalizeUpdateInputForValidation = (input: UpdateFundInput): UpdateFundInput =>
  input.description
    ? {
      ...input,
      description: normalizeDescriptionForValidation(input.description)
    }
    : input;

const createPublishValidationInput = (currentFund: Fund, input: UpdateFundInput): CreateFundInput => {
  const description = input.description ?? currentFund.description;

  return {
    fundNumber: input.fundNumber ?? currentFund.fundNumber,
    name: input.name ?? currentFund.name,
    documentCreationDate: input.documentCreationDate ?? currentFund.documentCreationDate,
    chronologicalBoundaries: input.chronologicalBoundaries ?? currentFund.chronologicalBoundaries,
    organizationForm: input.organizationForm ?? currentFund.organizationForm,
    description: normalizeDescriptionForValidation(description),
    status: BaseContentStatuses.Published
  };
};

export const FundMutation = {
  createFund: async (_: unknown, { input }: CreateFundArgs, context: GraphQLContext): Promise<Fund> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.fundRepository;
    const validatedInput = zFundSchema.parse(input);

    const { fundNumber } = validatedInput;

    const existing = await repo.findByFundNumber(fundNumber);
    if (existing) {
      throw new GraphQLError(FundErrors.NUMBER_ALREADY_EXISTS(fundNumber), {
        extensions: {
          code: FundErrorCodes.NUMBER_ALREADY_EXISTS
        }
      });
    }

    const res = await repo.create(validatedInput);

    return res;
  },

  updateFund: async (_: unknown, { id, input }: UpdateFundArgs, context: GraphQLContext): Promise<Fund> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.fundRepository;

    const isPublishing = input.status === BaseContentStatuses.Published;
    const inputForValidation = isPublishing ? normalizeUpdateInputForValidation(input) : input;
    const validateInput = zFundUpdateSchema.parse(inputForValidation);
    const updateInput = input.description ? { ...validateInput, description: input.description } : validateInput;

    if (validateInput.fundNumber !== undefined) {
      const existing = await repo.findByFundNumber(validateInput.fundNumber);
      if (existing && existing.id !== id) {
        throw new GraphQLError(FundErrors.NUMBER_ALREADY_EXISTS(validateInput.fundNumber), {
          extensions: {
            code: FundErrorCodes.NUMBER_ALREADY_EXISTS
          }
        });
      }
    }

    if (validateInput.status === BaseContentStatuses.Published) {
      const currentFund = await repo.findById(id);

      if (!currentFund) {
        throw new GraphQLError(FundErrors.FUND_NOT_FOUND(id), {
          extensions: {
            code: FundErrorCodes.FUND_NOT_FOUND
          }
        });
      }

      zFundSchema.parse(createPublishValidationInput(currentFund, validateInput));
    }

    const updatedFund = await repo.update(id, updateInput);

    if (!updatedFund) {
      throw new GraphQLError(FundErrors.FUND_NOT_FOUND(id), {
        extensions: {
          code: FundErrorCodes.FUND_NOT_FOUND
        }
      });
    }

    return updatedFund;
  },

  deleteFund: async (_: unknown, { id }: DeleteFundArgs, context: GraphQLContext): Promise<boolean> => {
    assertAuthenticated(context);
    const repo = context.requestContainer.cradle.fundRepository;

    return await repo.delete(id);
  }
};
