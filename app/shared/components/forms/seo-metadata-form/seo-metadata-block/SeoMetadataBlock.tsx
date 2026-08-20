'use client';
import { Box, TextField } from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import type { LocalizedMeta } from '../SeoMetadataForm';
import SeoMetadataForm from '../SeoMetadataForm';
import { styles } from '../SeoMetadataForm.styles';
import { seoFormErrors } from '~/constants/errors';
import { LocalizedCropRect } from '~/types/common';

export interface SeoBlockValue {
  meta: { uk: LocalizedMeta; en: LocalizedMeta };
  ogImage: string | null;
  allowIndexing: { uk: boolean; en: boolean };
  ticketUrl?: { uk: string; en: string };
}

export type SeoBlockErrors = {
  meta: {
    uk: Partial<Record<keyof LocalizedMeta, string>>;
    en: Partial<Record<keyof LocalizedMeta, string>>;
  };
  ticketUrl?: Partial<{ uk: string; en: string }>;
};

const defaultValue: SeoBlockValue = {
  meta: {
    uk: { title: '', description: '', keywords: '', canonicalUrl: undefined },
    en: { title: '', description: '', keywords: '', canonicalUrl: undefined }
  },
  ogImage: null,
  allowIndexing: { uk: true, en: true },
  ticketUrl: { uk: '', en: '' }
};

export interface SeoMetadataBlockProps {
  readonly showAlternativeText?: boolean;
  readonly showTicketUrl?: boolean;
  readonly extraFieldsBeforeKeywords?: boolean;
  readonly required?: boolean;
  readonly forceShowErrors?: boolean;
  readonly errors?: SeoBlockErrors;
  readonly value?: SeoBlockValue;
  readonly crop?: LocalizedCropRect | null;
  readonly onChangeCrop?: (newCrop: LocalizedCropRect | null) => void;
  readonly onChange?: (value: SeoBlockValue) => void;
  readonly extraFields?: (
    locale: 'uk' | 'en',
    value: LocalizedMeta,
    onChange: (val: LocalizedMeta) => void
  ) => ReactNode;
}

export default function SeoMetadataBlock({
  showAlternativeText = false,
  showTicketUrl = false,
  extraFieldsBeforeKeywords = false,
  required = true,
  forceShowErrors = false,
  errors,
  value: externalValue,
  crop,
  onChangeCrop,
  onChange: externalOnChange,
  extraFields
}: SeoMetadataBlockProps) {
  const [internalValue, setInternalValue] = useState<SeoBlockValue>(defaultValue);
  const [ticketUrlTouched, setTicketUrlTouched] = useState<{ uk: boolean; en: boolean }>({ uk: false, en: false });
  const [ticketUrlError, setTicketUrlError] = useState<{ uk: string; en: string }>({ uk: '', en: '' });
  const isExternalValidation = errors !== undefined;
  const [displayTicketErrors, setDisplayTicketErrors] = useState(errors?.ticketUrl);
  const isControlled = externalValue !== undefined && externalOnChange !== undefined;
  const value = isControlled ? externalValue : internalValue;

  const handleChange = (next: SeoBlockValue) => {
    if (isControlled) {
      externalOnChange(next);
    } else {
      setInternalValue(next);
    }
  };

  useEffect(() => {
    setDisplayTicketErrors(errors?.ticketUrl);
  }, [errors?.ticketUrl]);

  useEffect(() => {
    if (!forceShowErrors || isExternalValidation || !showTicketUrl) return;
    setTicketUrlTouched({ uk: true, en: true });
    setTicketUrlError({
      uk: validateTicketUrl(value.ticketUrl?.uk ?? '', 'uk'),
      en: validateTicketUrl(value.ticketUrl?.en ?? '', 'en')
    });
  }, [forceShowErrors, isExternalValidation, showTicketUrl, value.ticketUrl?.en, value.ticketUrl?.uk]);

  const validateTicketUrl = (val: string, locale: 'uk' | 'en') => {
    if (!val.trim()) return seoFormErrors[locale].required;
    try {
      new URL(val);
      return '';
    } catch {
      return seoFormErrors[locale].invalidUrl;
    }
  };

  const handleTicketUrlChange = (locale: 'uk' | 'en', val: string) => {
    handleChange({ ...value, ticketUrl: { ...(value.ticketUrl ?? { uk: '', en: '' }), [locale]: val } });
    if (isExternalValidation) {
      setDisplayTicketErrors((previous) => ({ ...previous, [locale]: '' }));
    } else if (ticketUrlTouched[locale]) {
      setTicketUrlError((prev) => ({ ...prev, [locale]: validateTicketUrl(val, locale) }));
    }
  };

  const handleTicketUrlBlur = (locale: 'uk' | 'en') => {
    if (isExternalValidation) return;
    setTicketUrlTouched((prev) => ({ ...prev, [locale]: true }));
    setTicketUrlError((prev) => ({ ...prev, [locale]: validateTicketUrl(value.ticketUrl?.[locale] ?? '', locale) }));
  };

  const buildExtraFields = (
    locale: 'uk' | 'en',
    localeMeta: LocalizedMeta,
    onLocaleMeta: (val: LocalizedMeta) => void
  ) => {
    const externalExtra = extraFields?.(locale, localeMeta, onLocaleMeta);
    if (!showTicketUrl) return externalExtra;
    let ticketUrlHelperText = '';
    if (isExternalValidation) {
      ticketUrlHelperText = displayTicketErrors?.[locale] ?? '';
    } else if (ticketUrlTouched[locale]) {
      ticketUrlHelperText = ticketUrlError[locale];
    }

    return (
      <>
        <TextField
          label="Ticket URL"
          value={value.ticketUrl?.[locale] ?? ''}
          onChange={(e) => handleTicketUrlChange(locale, e.target.value)}
          onBlur={() => handleTicketUrlBlur(locale)}
          error={
            isExternalValidation
              ? Boolean(displayTicketErrors?.[locale])
              : ticketUrlTouched[locale] && Boolean(ticketUrlError[locale])
          }
          helperText={ticketUrlHelperText}
          fullWidth
          size="small"
          sx={styles.textField}
          required
        />
        {externalExtra}
      </>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '4%', width: '100%' }}>
      <SeoMetadataForm
        value={value.meta.uk}
        onChange={(newMeta) => handleChange({ ...value, meta: { ...value.meta, uk: newMeta } })}
        locale="uk"
        ogImage={value.ogImage}
        onImageChange={(url) => handleChange({ ...value, ogImage: url })}
        allowIndexing={value.allowIndexing.uk}
        onIndexingChange={(val) => handleChange({ ...value, allowIndexing: { ...value.allowIndexing, uk: val } })}
        showAlternativeText={showAlternativeText}
        extraFieldsBeforeKeywords={extraFieldsBeforeKeywords}
        required={required}
        forceShowErrors={forceShowErrors}
        errors={errors?.meta.uk}
        crop={crop?.uk ?? null}
        onChangeCrop={(newUkCrop) => onChangeCrop?.({ uk: newUkCrop, en: crop?.en ?? null })}
        extraFields={
          showTicketUrl || extraFields
            ? (localeMeta, onLocaleMeta) => buildExtraFields('uk', localeMeta, onLocaleMeta)
            : undefined
        }
      />
      <SeoMetadataForm
        value={value.meta.en}
        onChange={(newMeta) => handleChange({ ...value, meta: { ...value.meta, en: newMeta } })}
        locale="en"
        ogImage={value.ogImage}
        onImageChange={(url) => handleChange({ ...value, ogImage: url })}
        allowIndexing={value.allowIndexing.en}
        onIndexingChange={(val) => handleChange({ ...value, allowIndexing: { ...value.allowIndexing, en: val } })}
        showAlternativeText={showAlternativeText}
        extraFieldsBeforeKeywords={extraFieldsBeforeKeywords}
        required={required}
        forceShowErrors={forceShowErrors}
        errors={errors?.meta.en}
        crop={crop?.en ?? null}
        onChangeCrop={(newEnCrop) => onChangeCrop?.({ uk: crop?.uk ?? null, en: newEnCrop })}
        extraFields={
          showTicketUrl || extraFields
            ? (localeMeta, onLocaleMeta) => buildExtraFields('en', localeMeta, onLocaleMeta)
            : undefined
        }
      />
    </Box>
  );
}
