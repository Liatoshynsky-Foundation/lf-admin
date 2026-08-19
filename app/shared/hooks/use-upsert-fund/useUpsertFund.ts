'use client';

import { JSONContent } from '@tiptap/react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { FundErrors } from '~/constants/errors';
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

const parseDescriptionValue = (value?: string | null): JSONContent => {
  if (!value) return createEmptyDoc();
  try {
    const parsed = JSON.parse(value) as unknown;
    if (typeof parsed === 'object' && parsed !== null && (parsed as { type?: unknown }).type === 'doc') {
      return parsed as JSONContent;
    }
  } catch {
    return textToProse(value);
  }
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

const ZOD_ERROR_REGEX = /\[\s*\{[\s\S]*\}\s*\]/;

const extractValidationErrors = (message: string): Partial<Record<keyof FundDetailsValue, string>> | null => {
  const match = ZOD_ERROR_REGEX.exec(message);
  if (!match) return null;

  try {
    const parsedErrors = JSON.parse(match[0]);
    if (!Array.isArray(parsedErrors)) return null;

    const newErrors: Partial<Record<keyof FundDetailsValue, string>> = {};
    let hasErrors = false;

    parsedErrors.forEach((err) => {
      const fieldName = err.path?.[0] as keyof FundDetailsValue;
      if (fieldName) {
        newErrors[fieldName] = err.message;
        hasErrors = true;
      }
    });

    return hasErrors ? newErrors : null;
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

    const docDate = typeof details.documentCreationDate === 'object' 
      ? (details.documentCreationDate as any)?.uk || '' 
      : details.documentCreationDate || '';

    if (!docDate.trim()) {
      newErrors.documentCreationDate = 'Дати утворення документів є обов’язковими.';
      isValid = false;
    } else if (docDate.length > 150) {
      newErrors.documentCreationDate = 'Значення не може перевищувати 150 символів.';
      isValid = false;
    }

    const chrono = typeof details.chronologicalBoundaries === 'object'
      ? (details.chronologicalBoundaries as any)?.uk || ''
      : details.chronologicalBoundaries || '';

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

  const handleSave = useCallback(
    async (status: BaseContentStatuses): Promise<string | null> => {
      setForceShowErrors(true);
      if (!validate()) {
        return null;
      }

      const payload = {
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
      };

      const successMessage = status === BaseContentStatuses.Published
        ? 'Фонд опубліковано.'
        : 'Фонд збережено.';

      try {
        let savedId: string | undefined = undefined;

        if (mode === 'create') {
          const result = await createFund(payload);
          savedId = result?.data?.createFund?.id;
        } else if (mode === 'edit' && id) {
          const result = await updateFund({ id, input: payload });
          savedId = result?.data?.updateFund?.id;
        }

        if (savedId) {
          setIsSaved(true);
          toast.success(successMessage);
          return savedId;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (message.includes('уже існує')) {
          const duplicateErrorMsg = FundErrors.NUMBER_ALREADY_EXISTS(Number(details.fundNumber));
          setErrors((prev) => ({ ...prev, fundNumber: duplicateErrorMsg }));
          setForceShowErrors(true);
          toast.error(duplicateErrorMsg);
          return null;
        }

        const backendErrors = extractValidationErrors(message);
        if (backendErrors) {
          setErrors((prev) => ({ ...prev, ...backendErrors }));
          setForceShowErrors(true);
          toast.error(FundErrors.FAILED_TO_CREATE);
          return null;
        }

        setForceShowErrors(true);
        toast.error(FundErrors.FAILED_TO_CREATE);
        console.error('Failed to save fund:', error);
      }

      return null;
    },
    [validate, details, mode, id, createFund, updateFund]
  );

  return {
    details,
    setDetails,
    errors,
    forceShowErrors,
    isSaved,
    handleSave
  };
};
