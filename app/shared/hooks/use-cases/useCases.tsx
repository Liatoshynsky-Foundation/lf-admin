'use client';

import { BaseContentStatuses } from '~/types/enums/common.enums';
import { type CaseFiltersInput, useAllCasesQuery } from '~/types/graphql/generated/graphql';

type QueryHookOptions = Readonly<{
  skip?: boolean;
}>;

const statusMap: Record<string, BaseContentStatuses> = {
  draft: BaseContentStatuses.Draft,
  published: BaseContentStatuses.Published,
  hidden: BaseContentStatuses.Hidden,
  archived: BaseContentStatuses.Archived,
  editing: BaseContentStatuses.Editing,
};

export function useAllCases(filters?: CaseFiltersInput | null, options: QueryHookOptions = {}) {
  const { data, loading, error, refetch } = useAllCasesQuery({
    variables: { filters },
    fetchPolicy: 'network-only',
    skip: options.skip
  });

  const cases = (data?.allCases ?? []).map((c) => {
    const status = statusMap[c.status] ?? BaseContentStatuses.Hidden;

    return {
      id: c.id,
      name: c.caseName.uk,
      fundId: c.fundId,
      descriptionNumber: c.descriptionNumber,
      caseNumber: c.caseNumber,
      sheetsNumber: c.sheetsNumber,
      status,
      dates: c.caseDate.uk,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
      editCaseDate: c.caseDate.uk,
      editCaseDescriptions: c.caseDescriptions.uk,
      detailedCaseDescription: c.detailedCaseDescription?.uk ?? '',
      pdfFile: c.pdfFile
        ? {
          name: c.pdfFile.filename,
          fileName: c.pdfFile.filename,
          url: c.pdfFile.url,
          mimeType: c.pdfFile.mimeType
        }
        : undefined
    };
  });

  return { cases, loading, error, refetch };
}
