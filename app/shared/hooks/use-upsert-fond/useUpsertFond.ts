'use client';

import { JSONContent } from '@tiptap/react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { FondErrors } from '~/constants/errors';
import { resolveLocalizedText, textToProse } from '~/lib/utils/prose';
import { FondDetailsErrors, FondDetailsValue } from '~/shared/components/forms/fond-details-block/FondDetailsBlock';
import { useCreateFond, useFondById, useUpdateFond } from '~/shared/hooks/use-fonds/useFonds';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import type { CreateFondInput } from '~/types/graphql/generated/graphql';

const createEmptyDoc = (): JSONContent => ({ type: 'doc', content: [] });

const createInitialDescription = (): FondDetailsValue['description'] => ({
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

const INITIAL_DETAILS: FondDetailsValue = {
  fondNumber: '',
  name: { uk: '', en: '' },
  documentCreationDate: '',
  chronologicalBoundaries: '',
  organizationForm: { uk: '', en: '' },
  description: createInitialDescription(),
  casesCount: 0,
  descriptionsCount: 0
};

const ZOD_ERROR_REGEX = /\[\s*\{[\s\S]*\}\s*\]/;

const extractValidationErrors = (message: string): Partial<Record<keyof FondDetailsValue, string>> | null => {
  const match = ZOD_ERROR_REGEX.exec(message);
  if (!match) return null;

  try {
    const parsedErrors = JSON.parse(match[0]);
    if (!Array.isArray(parsedErrors)) return null;

    const newErrors: Partial<Record<keyof FondDetailsValue, string>> = {};
    let hasErrors = false;

    parsedErrors.forEach((err) => {
      const fieldName = err.path?.[0] as keyof FondDetailsValue;
      if (fieldName) {
        newErrors[fieldName] = err.message;
        hasErrors = true;
      }
    });

    return hasErrors ? newErrors : null;
  } catch (parseError) {
    console.error('Error parsing backend error response:', parseError);
    return null;
  }
};

export const useUpsertFond = () => {
  const params = useParams<{ id?: string }>();
  const id = params.id;
  const mode = id ? 'edit' : 'create';

  const [details, setDetails] = useState<FondDetailsValue>(INITIAL_DETAILS);
  const [errors, setErrors] = useState<FondDetailsErrors>({});
  const [forceShowErrors, setForceShowErrors] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  const { data: queryData } = useFondById(id || '', { skip: !id });
  const [createFond] = useCreateFond();
  const [updateFond] = useUpdateFond();

  useEffect(() => {
    if (queryData?.findFondById) {
      const fond = queryData.findFondById;
      setDetails({
        fondNumber: String(fond.fondNumber),
        name: { uk: fond.name?.uk ?? '', en: fond.name?.en ?? '' },
        documentCreationDate: fond.documentCreationDate?.uk ?? '',
        chronologicalBoundaries: fond.chronologicalBoundaries?.uk ?? '',
        organizationForm: { uk: fond.organizationForm?.uk ?? '', en: fond.organizationForm?.en ?? '' },
        description: {
          uk: parseDescriptionValue(fond.description?.uk),
          en: parseDescriptionValue(fond.description?.en)
        },
        casesCount: fond.casesCount ?? 0,
        descriptionsCount: fond.descriptionsCount ?? 0
      });
    }
  }, [queryData]);

  useEffect(() => {
    setIsSaved(false);
  }, [details]);

  const validate = useCallback((): boolean => {
    const newErrors: FondDetailsErrors = {};
    let isValid = true;

    if (!details.fondNumber) {
      newErrors.fondNumber = 'Номер фонду є обов’язковим.';
      isValid = false;
    } else if (!/^\d+$/.test(details.fondNumber) || Number(details.fondNumber) <= 0) {
      newErrors.fondNumber = 'Номер фонду має бути цілим позитивним числом.';
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
        fondNumber: Number(details.fondNumber),
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
        status: status as unknown as CreateFondInput['status']
      };

      const successMessage = status === BaseContentStatuses.Published
        ? 'Фонд опубліковано.'
        : 'Фонд збережено.';

      try {
        let savedId: string | undefined = undefined;

        if (mode === 'create') {
          const result = await createFond(payload);
          savedId = result?.data?.createFond?.id;
        } else if (mode === 'edit' && id) {
          const result = await updateFond({ id, input: payload });
          savedId = result?.data?.updateFond?.id;
        }

        if (savedId) {
          setIsSaved(true);
          toast.success(successMessage);
          return savedId;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (message.includes('уже існує')) {
          const duplicateErrorMsg = FondErrors.NUMBER_ALREADY_EXISTS(Number(details.fondNumber));
          setErrors((prev) => ({ ...prev, fondNumber: duplicateErrorMsg }));
          setForceShowErrors(true);
          toast.error(duplicateErrorMsg);
          return null;
        }

        const backendErrors = extractValidationErrors(message);
        if (backendErrors) {
          setErrors((prev) => ({ ...prev, ...backendErrors }));
          setForceShowErrors(true);
          toast.error(FondErrors.FAILED_TO_CREATE);
          return null;
        }

        setForceShowErrors(true);
        toast.error(FondErrors.FAILED_TO_CREATE);
        console.error('Failed to save fond:', error);
      }

      return null;
    },
    [validate, details, mode, id, createFond, updateFond]
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
