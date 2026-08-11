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
  value: externalValue,
  crop,
  onChangeCrop,
  onChange: externalOnChange,
  extraFields
}: SeoMetadataBlockProps) {
  const [internalValue, setInternalValue] = useState<SeoBlockValue>(defaultValue);
  const [ticketUrlTouched, setTicketUrlTouched] = useState<{ uk: boolean; en: boolean }>({ uk: false, en: false });
  const [ticketUrlError, setTicketUrlError] = useState<{ uk: string; en: string }>({ uk: '', en: '' });

  useEffect(() => {
    if (forceShowErrors && showTicketUrl) {
      setTicketUrlTouched({ uk: true, en: true });
      setTicketUrlError({
        uk: validateTicketUrl(value?.ticketUrl?.uk ?? '', 'uk'),
        en: validateTicketUrl(value?.ticketUrl?.en ?? '', 'en')
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceShowErrors]);

  const validateTicketUrl = (val: string, locale: 'uk' | 'en') => {
    const translationForErrors = seoFormErrors[locale];
    if (!val.trim()) return translationForErrors.required;
    try {
      new URL(val);
      return '';
    } catch {
      return translationForErrors.invalidUrl;
    }
  };

  const handleTicketUrlChange = (locale: 'uk' | 'en', val: string) => {
    handleChange({ ...value, ticketUrl: { ...(value.ticketUrl ?? { uk: '', en: '' }), [locale]: val } });
    if (ticketUrlTouched[locale]) setTicketUrlError((prev) => ({ ...prev, [locale]: validateTicketUrl(val, locale) }));
  };

  const handleTicketUrlBlur = (locale: 'uk' | 'en') => {
    setTicketUrlTouched((prev) => ({ ...prev, [locale]: true }));
    setTicketUrlError((prev) => ({ ...prev, [locale]: validateTicketUrl(value.ticketUrl?.[locale] ?? '', locale) }));
  };

  const isControlled = externalValue !== undefined && externalOnChange !== undefined;
  const value = isControlled ? externalValue : internalValue;

  const handleChange = (next: SeoBlockValue) => {
    if (isControlled) {
      externalOnChange(next);
    } else {
      setInternalValue(next);
    }
  };

  const buildExtraFields = (
    locale: 'uk' | 'en',
    localeMeta: LocalizedMeta,
    onLocaleMeta: (val: LocalizedMeta) => void
  ) => {
    const externalExtra = extraFields?.(locale, localeMeta, onLocaleMeta);
    if (!showTicketUrl) return externalExtra;
    return (
      <>
        <TextField
          label="Ticket URL"
          value={value.ticketUrl?.[locale] ?? ''}
          onChange={(e) => handleTicketUrlChange(locale, e.target.value)}
          onBlur={() => handleTicketUrlBlur(locale)}
          error={ticketUrlTouched[locale] && Boolean(ticketUrlError[locale])}
          helperText={ticketUrlTouched[locale] && ticketUrlError[locale] ? ticketUrlError[locale] : ''}
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
