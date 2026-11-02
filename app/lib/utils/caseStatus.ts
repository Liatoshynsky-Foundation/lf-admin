import toast from 'react-hot-toast';

import { casesStatusMessages } from '~/constants/errors';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus } from '~/types/graphql/generated/graphql';

export const showCaseStatusToast = (nextStatus: CaseStatus, fundStatus?: BaseContentStatuses) => {
  if (nextStatus === CaseStatus.Published && fundStatus === BaseContentStatuses.Hidden) {
    toast(casesStatusMessages.publishHiddenFundWarning);
    return;
  }

  toast.success(nextStatus === CaseStatus.Published ? 'Справу успішно опубліковано' : 'Справу успішно сховано');
};

export const getCaseStatusErrorMessage = (error: unknown, nextStatus: CaseStatus): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (nextStatus === CaseStatus.Published) {
    return casesStatusMessages.publishError;
  }

  return casesStatusMessages.updateError;
};
