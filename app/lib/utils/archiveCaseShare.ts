import { ARCHIVE_BASE_PATH } from '~/constants/archive';

export const buildArchiveCaseShareUrl = (baseUrl: string, caseId: string, fundId?: string): string => {
  const encodedCaseId = encodeURIComponent(caseId);

  if (fundId) {
    return `${baseUrl}${ARCHIVE_BASE_PATH}/fund/${encodeURIComponent(fundId)}/edit?caseId=${encodedCaseId}`;
  }

  return `${baseUrl}${ARCHIVE_BASE_PATH}/cases?caseId=${encodedCaseId}`;
};
