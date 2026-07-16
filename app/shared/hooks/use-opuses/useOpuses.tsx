'use client';

import { useCallback } from 'react';

import { GroupRowData, IndividualWork } from '~/(logged_in)/creativity/WorksTable';
import { WorksLanguageValue, WorksTabValue } from '~/constants/creativity';
import { OpusErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  ContentLanguage,
  type CreateOpusInput,
  type CreateOpusMutation,
  type CreateOpusMutationVariables,
  type DeleteOpusMutationVariables,
  OpusStatus,
  type UpdateOpusMutation,
  type UpdateOpusMutationVariables,
  useCreateOpusMutation,
  useDeleteOpusMutation,
  useOpusByIdQuery,
  usePaginatedWorksQuery,
  useSearchCompositionsQuery,
  useUpdateOpusMutation,
  WorksTab
} from '~/types/graphql/generated/graphql';

type QueryHookOptions = Readonly<{
  skip?: boolean;
}>;
export const useOpusById = (id: string, options: QueryHookOptions = {}) =>
  useOpusByIdQuery({ variables: { id }, fetchPolicy: 'network-only', skip: options.skip || !id });

const TAB_TO_GQL: Record<WorksTabValue, WorksTab> = {
  all: WorksTab.All,
  opus: WorksTab.Opus,
  woo: WorksTab.Woo,
  works: WorksTab.Works
};

const LANGUAGE_TO_GQL: Record<WorksLanguageValue, ContentLanguage> = {
  uk: ContentLanguage.Uk,
  en: ContentLanguage.En,
  bilingual: ContentLanguage.Bilingual
};

const STATUS_TO_GQL: Record<BaseContentStatuses.Draft | BaseContentStatuses.Published, OpusStatus> = {
  [BaseContentStatuses.Draft]: OpusStatus.Draft,
  [BaseContentStatuses.Published]: OpusStatus.Published
};

type UsePaginatedWorksArgs = Readonly<{
  tab: WorksTabValue;
  search?: string;
  filters?: {
    statuses?: BaseContentStatuses[];
    languages?: WorksLanguageValue[];
  };
  page?: number;
  pageSize?: number;
}>;

export function usePaginatedWorks({ tab, search, filters, page, pageSize }: UsePaginatedWorksArgs) {
  const { data, loading, error } = usePaginatedWorksQuery({
    variables: {
      input: {
        tab: TAB_TO_GQL[tab],
        search,
        filters: filters
          ? {
            statuses: filters.statuses
              ?.filter(
                (status): status is BaseContentStatuses.Draft | BaseContentStatuses.Published =>
                  status === BaseContentStatuses.Draft || status === BaseContentStatuses.Published
              )
              .map((status) => STATUS_TO_GQL[status]),
            languages: filters.languages?.map((lang) => LANGUAGE_TO_GQL[lang])
          }
          : undefined,
        page,
        pageSize
      }
    },
    fetchPolicy: 'network-only'
  });

  const groups: GroupRowData[] = (data?.paginatedWorks.groups ?? []).map((g) => ({
    id: g.id,
    number: g.number,
    numberKind: g.numberKind === 'op' ? 'op' : 'bo',
    name: g.name.uk,
    genre: g.genre ?? '',
    startDate: g.creationYear,
    status: g.status === OpusStatus.Published ? BaseContentStatuses.Published : BaseContentStatuses.Draft,
    updatedAt: g.updatedAt,
    works: g.compositions?.map((c) => ({ id: c.id, title: c.title.uk })) ?? []
  }));

  const works: IndividualWork[] = (data?.paginatedWorks.works ?? []).map((w) => ({
    id: w.id,
    title: w.title.uk,
    year: w.year,
    genre: w.genre,
    status: w.status === OpusStatus.Published ? BaseContentStatuses.Published : BaseContentStatuses.Draft,
    updatedAt: w.updatedAt
  }));

  return {
    items: { groups, works },
    totalPages: data?.paginatedWorks.totalPages ?? 0,
    totalItems: data?.paginatedWorks.totalItems ?? 0,
    loading,
    error
  };
}

export const useSearchCompositions = (search: string, options: QueryHookOptions = {}) =>
  useSearchCompositionsQuery({ variables: { search }, fetchPolicy: 'network-only', skip: options.skip || !search });

export const useCreateOpus = () => {
  const [mutate, meta] = useCreateOpusMutation();
  const createOpus = useCallback(
    async (opus: CreateOpusInput) =>
      safeMutate<CreateOpusMutation, CreateOpusMutationVariables>(
        mutate,
        { input: opus },
        OpusErrors.NETWORK_ERROR_CREATE,
        OpusErrors.FAILED_TO_CREATE
      ),
    [mutate]
  );
  return [createOpus, meta] as const;
};

export const useUpdateOpus = () => {
  const [mutate, meta] = useUpdateOpusMutation();
  const updateOpus = useCallback(
    async (variables: UpdateOpusMutationVariables) =>
      safeMutate<UpdateOpusMutation, UpdateOpusMutationVariables>(
        mutate,
        variables,
        OpusErrors.NETWORK_ERROR_UPDATE,
        OpusErrors.FAILED_TO_UPDATE
      ),
    [mutate]
  );
  return [updateOpus, meta] as const;
};

export const useDeleteOpus = () => {
  const [mutate, meta] = useDeleteOpusMutation();
  const deleteOpus = useCallback(
    async (variables: DeleteOpusMutationVariables) =>
      safeMutate(mutate, variables, OpusErrors.NETWORK_ERROR_DELETE, OpusErrors.FAILED_TO_DELETE),
    [mutate]
  );
  return [deleteOpus, meta] as const;
};
