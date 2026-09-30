import { GraphQLError } from 'graphql';
import { ZodError, type ZodType } from 'zod';

import { graphqlErrors, ResearchWorkErrorCodes, ResearchWorkErrors } from '~/constants/errors';
import { ResearchWork } from '~/src/domain/entities/ResearchWork';
import { CreateResearchWorkInput, UpdateResearchWorkInput } from '~/src/domain/repositories/researchWorkRepository';
import { GraphQLContext } from '~/src/shared/types/container/types';
import {
  zResearchWorkSchema,
  zResearchWorkStatusSchema,
  zResearchWorkUpdateSchema
} from '~/src/validators/researchWork.schema';
import { BaseContentStatuses } from '~/types/enums/common.enums';

type CreateResearchWorkArgs = { input: CreateResearchWorkInput };
type UpdateResearchWorkArgs = { id: string; input: UpdateResearchWorkInput };
type UpdateResearchWorkStatusArgs = {
  id: string;
  input: { status: BaseContentStatuses.Published | BaseContentStatuses.Hidden };
};
type DeleteResearchWorkArgs = { id: string };

const assertAuthenticated = (context: GraphQLContext) => {
  if (!context.admin) {
    throw new GraphQLError(graphqlErrors.UNAUTHENTICATED.message, {
      extensions: { code: graphqlErrors.UNAUTHENTICATED.code }
    });
  }
};

const researchWorkNotFoundError = (id: string): GraphQLError =>
  new GraphQLError(ResearchWorkErrors.RESEARCH_WORK_NOT_FOUND(id), {
    extensions: { code: ResearchWorkErrorCodes.RESEARCH_WORK_NOT_FOUND }
  });

const parseResearchWorkInput = <T>(schema: ZodType<T>, input: unknown): T => {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      const message =
        error.issues.map((issue) => issue.message).join('; ') || 'Невірні дані наукової роботи.';

      throw new GraphQLError(message, {
        extensions: {
          code: 'BAD_USER_INPUT',
          issues: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        }
      });
    }

    throw error;
  }
};

const withPublishedAt = <T extends { status?: BaseContentStatuses; publishedAt?: string | null }>(
  input: T,
  previousPublishedAt?: string | null
): T => {
  if (input.status !== BaseContentStatuses.Published) {
    return input;
  }

  return {
    ...input,
    publishedAt: input.publishedAt ?? previousPublishedAt ?? new Date().toISOString()
  };
};

const updateExistingResearchWork = async (
  id: string,
  validatedInput: UpdateResearchWorkInput,
  context: GraphQLContext
): Promise<ResearchWork> => {
  const { researchWorkRepository: repo } = context.requestContainer.cradle;

  const current = await repo.findById(id);
  if (!current) {
    throw researchWorkNotFoundError(id);
  }

  const updated = await repo.update(id, withPublishedAt(validatedInput, current.publishedAt));
  if (!updated) {
    throw researchWorkNotFoundError(id);
  }

  return updated;
};

export const ResearchWorkMutation = {
  createResearchWork: async (
    _: unknown,
    { input }: CreateResearchWorkArgs,
    context: GraphQLContext
  ): Promise<ResearchWork> => {
    assertAuthenticated(context);

    const { researchWorkRepository: repo } = context.requestContainer.cradle;
    const validatedInput = parseResearchWorkInput(zResearchWorkSchema, input);

    return repo.create(withPublishedAt(validatedInput));
  },

  updateResearchWork: async (
    _: unknown,
    { id, input }: UpdateResearchWorkArgs,
    context: GraphQLContext
  ): Promise<ResearchWork> => {
    assertAuthenticated(context);

    const validatedInput = parseResearchWorkInput(zResearchWorkUpdateSchema, input);
    return updateExistingResearchWork(id, validatedInput, context);
  },

  updateResearchWorkStatus: async (
    _: unknown,
    { id, input }: UpdateResearchWorkStatusArgs,
    context: GraphQLContext
  ): Promise<ResearchWork> => {
    assertAuthenticated(context);

    const validatedInput = parseResearchWorkInput(zResearchWorkStatusSchema, input);
    return updateExistingResearchWork(id, validatedInput, context);
  },

  deleteResearchWork: async (
    _: unknown,
    { id }: DeleteResearchWorkArgs,
    context: GraphQLContext
  ): Promise<boolean> => {
    assertAuthenticated(context);

    const { researchWorkRepository: repo } = context.requestContainer.cradle;
    return repo.delete(id);
  }
};
