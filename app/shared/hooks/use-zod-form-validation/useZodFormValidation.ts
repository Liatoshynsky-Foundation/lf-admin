import { useState } from 'react';
import type { z } from 'zod';

export type FormErrors = Record<string, string>;

type UseZodFormValidationOptions<TValues, TOutput> = {
  validate: (values: TValues) => z.ZodSafeParseResult<TOutput>;
};

const toFormErrors = (error: z.ZodError): FormErrors => {
  const errors: FormErrors = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!(path in errors)) errors[path] = issue.message;
  });

  return errors;
};

export const getFormErrorsByPrefix = (errors: FormErrors, prefix: string): FormErrors =>
  Object.fromEntries(
    Object.entries(errors)
      .filter(([path]) => path.startsWith(`${prefix}.`))
      .map(([path, message]) => [path.slice(prefix.length + 1), message])
  );

export const useZodFormValidation = <TValues, TOutput = TValues>({ validate}: UseZodFormValidationOptions<TValues, TOutput>) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const validateOnSubmit = (values: TValues): z.ZodSafeParseResult<TOutput> => {
    setHasSubmitted(true);

    const result = validate(values);
    setErrors(result.success ? {} : toFormErrors(result.error));

    return result;
  };

  const revalidateFields = (values: TValues, ...paths: string[]) => {
    if (!hasSubmitted) return;

    const result = validate(values);
    const validationErrors = result.success ? {} : toFormErrors(result.error);

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };

      paths.forEach((path) => {
        if (path in validationErrors) nextErrors[path] = validationErrors[path];
        else delete nextErrors[path];
      });

      return nextErrors;
    });
  };

  const clearFieldErrors = (...paths: string[]) => {
    setErrors((currentErrors) => {
      if (!paths.some((path) => path in currentErrors)) return currentErrors;

      const nextErrors = { ...currentErrors };
      paths.forEach((path) => delete nextErrors[path]);
      return nextErrors;
    });
  };

  const resetValidation = () => {
    setErrors({});
    setHasSubmitted(false);
  };

  return { errors, hasSubmitted, validateOnSubmit, revalidateFields, clearFieldErrors, resetValidation };
};
