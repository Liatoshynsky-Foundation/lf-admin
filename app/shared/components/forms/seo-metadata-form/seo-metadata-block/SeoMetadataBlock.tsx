'use client';
import { Box, TextField } from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import type { LocalizedMeta, SeoFieldsRequired, SeoFormLabels } from '../SeoMetadataForm';
import SeoMetadataForm from '../SeoMetadataForm';
import { styles } from '../SeoMetadataForm.styles';
import { syncAltAcrossLocales } from './syncAltAcrossLocales';
import { seoFormErrors } from '~/constants/errors';
import { TICKET_URL_PLACEHOLDER } from '~/constants/publications';
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
  readonly required?: boolean | Readonly<Record<'uk' | 'en', SeoFieldsRequired>>;
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
  readonly labels?: Readonly<{ uk?: SeoFormLabels; en?: SeoFormLabels }>;
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
  extraFields,
  labels
}: SeoMetadataBlockProps) {
  const [internalValue, setInternalValue] = useState<SeoBlockValue>(defaultValue);
  const [ticketUrlTouched, setTicketUrlTouched] = useState<{ uk: boolean; en: boolean }>({ uk: false, en: false });
  const [ticketUrlError, setTicketUrlError] = useState<{ uk: string; en: string }>({ uk: '', en: '' });
  const isExternalValidation = errors !== undefined;
  const [displayTicketErrors, setDisplayTicketErrors] = useState(errors?.ticketUrl);
  const isControlled = externalValue !== undefined && externalOnChange !== undefined;
  const value = isControlled ? externalValue : internalValue;
  const isLocaleRequired = (locale: 'uk' | 'en'): SeoFieldsRequired =>
    typeof required === 'boolean' ? required : required[locale];

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

  const handleTicketUrlChange = (_locale: 'uk' | 'en', val: string) => {
    handleChange({ ...value, ticketUrl: { uk: val, en: val } });

    if (isExternalValidation) {
      setDisplayTicketErrors({ uk: '', en: '' });
    } else if (ticketUrlTouched.uk || ticketUrlTouched.en) {
      setTicketUrlError({
        uk: validateTicketUrl(val, 'uk'),
        en: validateTicketUrl(val, 'en')
      });
    }
  };

  const handleTicketUrlBlur = (locale: 'uk' | 'en') => {
    if (isExternalValidation) return;
    const currentUrl = value.ticketUrl?.[locale] ?? '';
    setTicketUrlTouched({ uk: true, en: true });
    setTicketUrlError({
      uk: validateTicketUrl(currentUrl, 'uk'),
      en: validateTicketUrl(currentUrl, 'en')
    });
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
          label={labels?.[locale]?.ticketUrl ?? 'Ticket URL'}
          value={value.ticketUrl?.[locale] ?? ''}
          onChange={(e) => handleTicketUrlChange(locale, e.target.value)}
          onBlur={() => handleTicketUrlBlur(locale)}
          error={
            isExternalValidation
              ? Boolean(displayTicketErrors?.[locale])
              : ticketUrlTouched[locale] && Boolean(ticketUrlError[locale])
          }
          helperText={ticketUrlHelperText}
          placeholder={TICKET_URL_PLACEHOLDER}
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
        onChange={(newMeta) => handleChange(syncAltAcrossLocales(value, 'uk', newMeta))}
        locale="uk"
        ogImage={value.ogImage}
        onImageChange={(url) => handleChange({ ...value, ogImage: url })}
        allowIndexing={value.allowIndexing.uk}
        onIndexingChange={(val) => handleChange({ ...value, allowIndexing: { ...value.allowIndexing, uk: val } })}
        showAlternativeText={showAlternativeText}
        extraFieldsBeforeKeywords={extraFieldsBeforeKeywords}
        required={isLocaleRequired('uk')}
        forceShowErrors={forceShowErrors}
        errors={errors?.meta.uk}
        crop={crop?.uk ?? null}
        onChangeCrop={(newUkCrop) => onChangeCrop?.({ uk: newUkCrop, en: newUkCrop })}
        labels={labels?.uk}
        extraFields={
          showTicketUrl || extraFields
            ? (localeMeta, onLocaleMeta) => buildExtraFields('uk', localeMeta, onLocaleMeta)
            : undefined
        }
      />
      <SeoMetadataForm
        value={value.meta.en}
        onChange={(newMeta) => handleChange(syncAltAcrossLocales(value, 'en', newMeta))}
        locale="en"
        ogImage={value.ogImage}
        onImageChange={(url) => handleChange({ ...value, ogImage: url })}
        allowIndexing={value.allowIndexing.en}
        onIndexingChange={(val) => handleChange({ ...value, allowIndexing: { ...value.allowIndexing, en: val } })}
        showAlternativeText={showAlternativeText}
        extraFieldsBeforeKeywords={extraFieldsBeforeKeywords}
        required={isLocaleRequired('en')}
        forceShowErrors={forceShowErrors}
        errors={errors?.meta.en}
        crop={crop?.en ?? null}
        onChangeCrop={(newEnCrop) => onChangeCrop?.({ uk: newEnCrop, en: newEnCrop })}
        labels={labels?.en}
        extraFields={
          showTicketUrl || extraFields
            ? (localeMeta, onLocaleMeta) => buildExtraFields('en', localeMeta, onLocaleMeta)
            : undefined
        }
      />
    </Box>
  );
}
