import { useEffect, useState } from 'react';

import { proseToText } from '~/lib/utils/prose';
import { useStore } from '~/store';
import { ProseDoc } from '~/types/common';

const EMPTY_TITLE_MESSAGE = 'Заголовок не може бути порожнім';

/**
 * Tracks emptiness validation for a single rich-text title field and mirrors
 * the result into the shared store so the page-level Save button can be
 * disabled while any title on the page is invalid.
 *
 * `key` must be unique per field across the whole app, e.g. `${pageId}:${blockId}:title`.
 */
export const useTitleValidation = (key: string, value?: ProseDoc) => {
  const setFieldValidity = useStore((state) => state.setFieldValidity);
  const [touched, setTouched] = useState(false);

  const isEmpty = proseToText(value).trim() === '';
  const error = touched && isEmpty;

  useEffect(() => {
    setFieldValidity(key, error);
  }, [key, error, setFieldValidity]);

  useEffect(() => () => setFieldValidity(key, false), [key, setFieldValidity]);

  return {
    error,
    helperText: error ? EMPTY_TITLE_MESSAGE : undefined,
    onBlur: () => setTouched(true)
  };
};
