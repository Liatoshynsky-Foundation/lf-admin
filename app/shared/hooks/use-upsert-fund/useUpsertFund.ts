'use client';

import { JSONContent } from '@tiptap/react';
import { useParams } from 'next/navigation';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { FundErrors } from '~/constants/errors';
import { FUND_PUBLISH_SUCCESS_MESSAGE } from '~/constants/fund';
import { resolveLocalizedText, textToProse } from '~/lib/utils/prose';
import { FundDetailsErrors, FundDetailsValue } from '~/shared/components/forms/fund-details-block/FundDetailsBlock';
import { useCreateFund, useFundById, useUpdateFund } from '~/shared/hooks/use-funds/useFunds';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import type { CreateFundInput } from '~/types/graphql/generated/graphql';

const createEmptyDoc = (): JSONContent => ({ type: 'doc', content: [] });

const createInitialDescription = (): FundDetailsValue['description'] => ({
  uk: createEmptyDoc(),
  en: createEmptyDoc()
});

const isDocContent = (value: unknown): value is JSONContent => {
  return typeof value === 'object' && value !== null && 'type' in value && value.type === 'doc';
};

const parseDescriptionValue = (value?: string | null): JSONContent => {
  if (!value) return createEmptyDoc();

  try {
    const parsed = JSON.parse(value);
    if (isDocContent(parsed)) {
      return parsed;
    }
  } catch {}

  return textToProse(value);
};

const INITIAL_DETAILS: FundDetailsValue = {
  fundNumber: '',
  name: { uk: '', en: '' },
  documentCreationDate: '',
  chronologicalBoundaries: '',
  organizationForm: { uk: '', en: '' },
  description: createInitialDescription(),
  casesCount: 0,
  descriptionsCount: 0
};

const resolveFundStatus = (status?: string | null): BaseContentStatuses => {
  const statuses = Object.values(BaseContentStatuses);
  return statuses.includes(status as BaseContentStatuses)
    ? (status as BaseContentStatuses)
    : BaseContentStatuses.Hidden;
};

const buildFundPayload = (details: FundDetailsValue, status: BaseContentStatuses): CreateFundInput => ({
  fundNumber: Number(details.fundNumber),
  name: details.name,
  documentCreationDate: { uk: details.documentCreationDate, en: details.documentCreationDate },
  chronologicalBoundaries: details.chronologicalBoundaries
    ? { uk: details.chronologicalBoundaries, en: details.chronologicalBoundaries }
    : undefined,
  organizationForm: details.organizationForm?.uk ? details.organizationForm : undefined,
  description: {
    uk: JSON.stringify(details.description.uk),
    en: JSON.stringify(details.description.en)
  },
  status: status as unknown as CreateFundInput['status']
});

const getFundSaveMessages = (status: BaseContentStatuses) => {
  const isPublishing = status === BaseContentStatuses.Published;

  return {
    successMessage: isPublishing ? FUND_PUBLISH_SUCCESS_MESSAGE : 'Фонд збережено.',
    errorMessage: isPublishing ? FundErrors.FAILED_TO_PUBLISH : FundErrors.FAILED_TO_CREATE
  };
};

type SaveErrorHandlers = {
  errorMessage: string;
  fundNumber: string;
  setErrors: Dispatch<SetStateAction<FundDetailsErrors>>;
  setForceShowErrors: Dispatch<SetStateAction<boolean>>;
};

const handleFundSaveError = (
  error: unknown,
  { errorMessage, fundNumber, setErrors, setForceShowErrors }: SaveErrorHandlers
): null => {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('уже існує')) {
    const duplicateErrorMsg = FundErrors.NUMBER_ALREADY_EXISTS(Number(fundNumber));
    setErrors((prev) => ({ ...prev, fundNumber: duplicateErrorMsg }));
    setForceShowErrors(true);
    toast.error(duplicateErrorMsg);
    return null;
  }

  const backendErrors = extractValidationErrors(error);
  if (backendErrors) {
    setErrors((prev) => ({ ...prev, ...backendErrors }));
  }

  setForceShowErrors(true);
  toast.error(errorMessage);
  return null;
};

const extractValidationErrors = (error: unknown): FundDetailsErrors | null => {
  const message = error instanceof Error ? error.message : String(error);

  const startIndex = message.indexOf('[');
  const endIndex = message.lastIndexOf(']');

  if (startIndex === -1 || endIndex < startIndex) {
    return null;
  }

  try {
    const parsed = JSON.parse(message.slice(startIndex, endIndex + 1));
    if (!Array.isArray(parsed)) return null;

    const errors: FundDetailsErrors = {};
    let hasErrors = false;

    for (const issue of parsed) {
      const safeIssue = issue as { path?: unknown; message?: unknown } | null;

      const fieldName = Array.isArray(safeIssue?.path) ? safeIssue.path[0] : undefined;

      if (typeof fieldName === 'string' && typeof safeIssue?.message === 'string') {
        errors[fieldName as keyof FundDetailsValue] = safeIssue.message;
        hasErrors = true;
      }
    }

    return hasErrors ? errors : null;
  } catch {
    return null;
  }
};

export const useUpsertFund = () => {
  const params = useParams<{ id?: string }>();
  const id = params.id;
  const mode = id ? 'edit' : 'create';

  const [details, setDetails] = useState<FundDetailsValue>(INITIAL_DETAILS);
  const [errors, setErrors] = useState<FundDetailsErrors>({});
  const [forceShowErrors, setForceShowErrors] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<BaseContentStatuses | undefined>(
    mode === 'create' ? BaseContentStatuses.Hidden : undefined
  );

  const { data: queryData } = useFundById(id || '', { skip: !id });
  const [createFund] = useCreateFund();
  const [updateFund] = useUpdateFund();

  useEffect(() => {
    if (queryData?.findFundById) {
      const fund = queryData.findFundById;
      setDetails({
        fundNumber: String(fund.fundNumber),
        name: { uk: fund.name?.uk ?? '', en: fund.name?.en ?? '' },
        documentCreationDate: fund.documentCreationDate?.uk ?? '',
        chronologicalBoundaries: fund.chronologicalBoundaries?.uk ?? '',
        organizationForm: { uk: fund.organizationForm?.uk ?? '', en: fund.organizationForm?.en ?? '' },
        description: {
          uk: parseDescriptionValue(fund.description?.uk),
          en: parseDescriptionValue(fund.description?.en)
        },
        casesCount: fund.casesCount ?? 0,
        descriptionsCount: fund.descriptionsCount ?? 0
      });
      setCurrentStatus(resolveFundStatus(fund.status));
    }
  }, [queryData]);

  useEffect(() => {
    setIsSaved(false);
  }, [details]);

  const validate = useCallback((): boolean => {
    const newErrors: FundDetailsErrors = {};
    let isValid = true;

    if (!details.fundNumber) {
      newErrors.fundNumber = 'Номер фонду є обов’язковим.';
      isValid = false;
    } else if (!/^\d+$/.test(details.fundNumber) || Number(details.fundNumber) <= 0) {
      newErrors.fundNumber = 'Номер фонду має бути цілим позитивним числом.';
      isValid = false;
    }

    const nameUk = details.name?.uk || '';

    if (!nameUk.trim()) {
      newErrors.name = 'Назва фонду є обов’язковою.';
      isValid = false;
    } else if (nameUk.length > 40) {
      newErrors.name = 'Назва не може перевищувати 40 символів.';
      isValid = false;
    }

    const docDate = details.documentCreationDate || '';

    if (!docDate.trim()) {
      newErrors.documentCreationDate = 'Дати утворення документів є обов’язковими.';
      isValid = false;
    } else if (docDate.length > 150) {
      newErrors.documentCreationDate = 'Значення не може перевищувати 150 символів.';
      isValid = false;
    }

    const chrono = details.chronologicalBoundaries || '';

    if (chrono.trim() && chrono.length > 150) {
      newErrors.chronologicalBoundaries = 'Значення не може перевищувати 150 символів.';
      isValid = false;
    }

    const orgFormUk = details.organizationForm?.uk || '';

    if (orgFormUk.trim() && orgFormUk.length > 150) {
      newErrors.organizationForm = 'Значення не може перевищувати 150 символів.';
      isValid = false;
    }

    const rawDescription = resolveLocalizedText(details.description?.uk);
    if (rawDescription && rawDescription.length > 1000) {
      newErrors.description = 'Опис не може перевищувати 1000 символів.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [details]);

  const saveFund = useCallback(
    async (payload: CreateFundInput): Promise<string | undefined> => {
      if (mode === 'create') {
        const result = await createFund(payload);
        return result?.data?.createFund?.id;
      }

      if (mode === 'edit' && id) {
        const result = await updateFund({ id, input: payload });
        return result?.data?.updateFund?.id;
      }

      return undefined;
    },
    [mode, id, createFund, updateFund]
  );

  const handleSave = useCallback(
    async (status: BaseContentStatuses): Promise<string | null> => {
      setForceShowErrors(true);
      if (!validate()) {
        return null;
      }

      const payload = buildFundPayload(details, status);
      const { successMessage, errorMessage } = getFundSaveMessages(status);

      try {
        const savedId = await saveFund(payload);

        if (savedId) {
          setIsSaved(true);
          setCurrentStatus(status);
          toast.success(successMessage);
          return savedId;
        }
      } catch (error) {
        return handleFundSaveError(error, {
          errorMessage,
          fundNumber: details.fundNumber,
          setErrors,
          setForceShowErrors
        });
      }

      return null;
    },
    [validate, details, saveFund]
  );

  return {
    details,
    setDetails,
    errors,
    forceShowErrors,
    isSaved,
    currentStatus,
    fundId: id,
    handleSave
  };
};
