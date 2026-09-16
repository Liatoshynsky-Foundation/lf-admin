import { act, renderHook } from '@testing-library/react';
import { z } from 'zod';

import { getFormErrorsByPrefix, useZodFormValidation } from './useZodFormValidation';

const ERROR_MESSAGES = {
  number: 'Number is invalid',
  name: 'Name is required',
  email: 'Email is invalid',
  link: 'Link is invalid',
  other: 'Other is required',
  shortValue: 'Value is too short',
  digitsValue: 'Value must contain digits'
} as const;

const FORM_PATHS = {
  number: 'number',
  name: 'name',
  email: 'email',
  contactEmail: 'contactInformation.email',
  contactName: 'contactInformation.name',
  other: 'other'
} as const;

const formSchema = z.object({
  number: z.string().regex(/^\d+$/, ERROR_MESSAGES.number),
  name: z.string().min(1, ERROR_MESSAGES.name),
  email: z.string().email(ERROR_MESSAGES.email)
});

const INVALID_FORM_VALUES = { number: 'invalid-number', name: '', email: 'invalid-email' };
const VALID_FORM_VALUES = { number: '1', name: 'Valid name', email: 'valid@example.com' };
const FORM_ERRORS = {
  [FORM_PATHS.number]: ERROR_MESSAGES.number,
  [FORM_PATHS.name]: ERROR_MESSAGES.name,
  [FORM_PATHS.email]: ERROR_MESSAGES.email
};
const CONTACT_FORM_PREFIX = 'contactInformation';
const CONTACT_FORM_ERRORS = {
  [`${CONTACT_FORM_PREFIX}.email`]: ERROR_MESSAGES.email,
  [`${CONTACT_FORM_PREFIX}.foundationName.uk`]: ERROR_MESSAGES.name,
  [`${CONTACT_FORM_PREFIX}.socialNetworks.0.link`]: ERROR_MESSAGES.link
};
const CONTACT_INFORMATION_ERRORS = {
  email: ERROR_MESSAGES.email,
  'foundationName.uk': ERROR_MESSAGES.name,
  'socialNetworks.0.link': ERROR_MESSAGES.link
};

const validateFormValues = (values: z.input<typeof formSchema>) => formSchema.safeParse(values);

describe('toFormErrors', () => {
  it('maps Zod issues to field-path errors through form validation', () => {
    const { result } = renderHook(() => useZodFormValidation({ validate: validateFormValues }));

    act(() => {
      result.current.validateOnSubmit(INVALID_FORM_VALUES);
    });

    expect(result.current.errors).toEqual(FORM_ERRORS);
  });
});

describe('getFormErrorsByPrefix', () => {
  it('returns errors below the requested path without the prefix', () => {
    expect(getFormErrorsByPrefix(CONTACT_FORM_ERRORS, CONTACT_FORM_PREFIX)).toEqual(CONTACT_INFORMATION_ERRORS);
  });

  it('returns an empty object when no error paths match', () => {
    expect(getFormErrorsByPrefix(CONTACT_FORM_ERRORS, 'unknown')).toEqual({});
  });
});

describe('useZodFormValidation', () => {
  describe('validateOnSubmit', () => {
    it('returns a successful result and clears errors for valid values', () => {
      const { result } = renderHook(() => useZodFormValidation({ validate: validateFormValues }));

      act(() => {
        expect(result.current.validateOnSubmit(VALID_FORM_VALUES).success).toBe(true);
      });

      expect(result.current.hasSubmitted).toBe(true);
      expect(result.current.errors).toEqual({});
    });

    it('returns a failed result and stores all errors for invalid values', () => {
      const { result } = renderHook(() => useZodFormValidation({ validate: validateFormValues }));

      act(() => {
        expect(result.current.validateOnSubmit(INVALID_FORM_VALUES).success).toBe(false);
      });

      expect(result.current.errors).toEqual(FORM_ERRORS);
    });
  });

  describe('revalidateFields', () => {
    it('does not validate fields before the first submit attempt', () => {
      const { result } = renderHook(() => useZodFormValidation({ validate: validateFormValues }));

      act(() => {
        result.current.revalidateFields(INVALID_FORM_VALUES, FORM_PATHS.email);
      });

      expect(result.current.errors).toEqual({});
    });

    it('revalidates only the requested Opus-style number field after submit', () => {
      const { result } = renderHook(() => useZodFormValidation({ validate: validateFormValues }));

      act(() => {
        result.current.validateOnSubmit(INVALID_FORM_VALUES);
      });

      act(() => {
        result.current.revalidateFields(
          { ...INVALID_FORM_VALUES, number: VALID_FORM_VALUES.number },
          FORM_PATHS.number
        );
      });

      expect(result.current.errors).toEqual({
        [FORM_PATHS.name]: FORM_ERRORS.name,
        [FORM_PATHS.email]: FORM_ERRORS.email
      });
    });

    it('keeps a requested error when its field is still invalid', () => {
      const { result } = renderHook(() => useZodFormValidation({ validate: validateFormValues }));

      act(() => {
        result.current.validateOnSubmit(INVALID_FORM_VALUES);
      });

      act(() => {
        result.current.revalidateFields(INVALID_FORM_VALUES, FORM_PATHS.number);
      });

      expect(result.current.errors).toEqual(FORM_ERRORS);
    });

    it('clears a requested error when the complete form is valid', () => {
      const { result } = renderHook(() => useZodFormValidation({ validate: validateFormValues }));

      act(() => {
        result.current.validateOnSubmit(INVALID_FORM_VALUES);
      });

      act(() => {
        result.current.revalidateFields(VALID_FORM_VALUES, FORM_PATHS.email);
      });

      expect(result.current.errors).toEqual({
        [FORM_PATHS.number]: FORM_ERRORS.number,
        [FORM_PATHS.name]: FORM_ERRORS.name
      });
    });
  });

  describe('clearFieldErrors', () => {
    it('clears only the requested errors', () => {
      const { result } = renderHook(() => useZodFormValidation({ validate: validateFormValues }));

      act(() => {
        result.current.validateOnSubmit(INVALID_FORM_VALUES);
      });

      act(() => {
        result.current.clearFieldErrors(FORM_PATHS.number, FORM_PATHS.email);
      });

      expect(result.current.errors).toEqual({ name: FORM_ERRORS.name });
    });

    it('keeps errors unchanged when no requested path has an error', () => {
      const { result } = renderHook(() => useZodFormValidation({ validate: validateFormValues }));

      act(() => {
        result.current.clearFieldErrors('unknown');
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('resetValidation', () => {
    it('clears errors and resets the submitted state', () => {
      const { result } = renderHook(() => useZodFormValidation({ validate: validateFormValues }));

      act(() => {
        result.current.validateOnSubmit(INVALID_FORM_VALUES);
      });

      expect(result.current.hasSubmitted).toBe(true);
      expect(result.current.errors).toEqual(FORM_ERRORS);

      act(() => {
        result.current.resetValidation();
      });

      expect(result.current.hasSubmitted).toBe(false);
      expect(result.current.errors).toEqual({});
    });
  });
});
