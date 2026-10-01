import toast from 'react-hot-toast';

import { getCaseStatusErrorMessage, showCaseStatusSuccessToast } from './caseStatus';
import { casesStatusMessages } from '~/constants/errors';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { CaseStatus } from '~/types/graphql/generated/graphql';

jest.mock('react-hot-toast', () => {
  const toast = Object.assign(jest.fn(), {
    success: jest.fn()
  });

  return {
    __esModule: true,
    default: toast
  };
});

describe('caseStatus helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('showCaseStatusSuccessToast', () => {
    it.each([
      [CaseStatus.Published, 'Справу успішно опубліковано'],
      [CaseStatus.Draft, 'Справу успішно сховано']
    ])('should show the correct success toast for $0 status', (status, message) => {
      showCaseStatusSuccessToast(status);
      expect(toast.success).toHaveBeenCalledWith(message);
    });

    it('should show a warning when publishing a case under a hidden fund', () => {
      showCaseStatusSuccessToast(CaseStatus.Published, BaseContentStatuses.Hidden);
      expect(toast.success).toHaveBeenCalledWith('Справу успішно опубліковано');
      expect(toast).toHaveBeenCalledWith(casesStatusMessages.publishHiddenFundWarning);
    });
  });

  describe('getCaseStatusErrorMessage', () => {
    it('should return the original error message', () => {
      const error = new Error('Something went wrong');
      expect(getCaseStatusErrorMessage(error, CaseStatus.Published)).toBe('Something went wrong');
    });

    it.each([
      [CaseStatus.Published, casesStatusMessages.publishError],
      [CaseStatus.Draft, casesStatusMessages.updateError]
    ])('should return the correct fallback message for $0 status', (status, expectedMessage) => {
      expect(getCaseStatusErrorMessage('boom', status)).toBe(expectedMessage);
    });
  });
});
