import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  type ResearchWorkFieldsFragment,
  ResearchWorkStatus as GqlResearchWorkStatus
} from '~/types/graphql/generated/graphql';
import type { ResearchWork, ResearchWorkStatus } from '~/types/researchWork';

export const toUiResearchWorkStatus = (status: GqlResearchWorkStatus): ResearchWorkStatus =>
  status === GqlResearchWorkStatus.Published ? BaseContentStatuses.Published : BaseContentStatuses.Hidden;

export const toGqlResearchWorkStatus = (status: ResearchWorkStatus): GqlResearchWorkStatus | null => {
  if (status === BaseContentStatuses.Published) {
    return GqlResearchWorkStatus.Published;
  }
  if (status === BaseContentStatuses.Hidden) {
    return GqlResearchWorkStatus.Hidden;
  }
  return null;
};

export const mapResearchWork = (item: ResearchWorkFieldsFragment): ResearchWork => ({
  id: item.id,
  bibliographicDescription: item.bibliographicDescription,
  year: item.year,
  keywords: item.keywords ?? '',
  url: item.url ?? undefined,
  pdfFile: item.pdfFile
    ? {
      filename: item.pdfFile.filename,
      url: item.pdfFile.url,
      mimeType: item.pdfFile.mimeType
    }
    : undefined,
  status: toUiResearchWorkStatus(item.status),
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  publishedAt: item.publishedAt ?? undefined
});
