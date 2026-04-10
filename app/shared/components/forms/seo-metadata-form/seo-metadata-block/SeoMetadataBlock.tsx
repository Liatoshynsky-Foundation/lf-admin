'use client';
import { Box, TextField } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';

import type { LocalizedMeta } from '../SeoMetadataForm';
import SeoMetadataForm from '../SeoMetadataForm';
import { styles } from '../SeoMetadataForm.styles';

export interface SeoBlockValue {
  meta: { uk: LocalizedMeta; en: LocalizedMeta };
  ogImage: File | string | null;
  allowIndexing: { uk: boolean; en: boolean };
  ticketUrl?: string;
}

const defaultValue: SeoBlockValue = {
  meta: {
    uk: { title: '', description: '', keywords: '', canonicalUrl: undefined },
    en: { title: '', description: '', keywords: '', canonicalUrl: undefined }
  },
  ogImage: null,
  allowIndexing: { uk: true, en: true },
  ticketUrl: ''
};

export interface SeoMetadataBlockProps {
  readonly showAlternativeText?: boolean;
  readonly showTicketUrl?: boolean;
  readonly value?: SeoBlockValue;
  readonly onChange?: (value: SeoBlockValue) => void;
  readonly extraFields?: (locale: 'uk' | 'en', value: LocalizedMeta, onChange: (val: LocalizedMeta) => void) => ReactNode;
}

export default function SeoMetadataBlock({
  showAlternativeText = false,
  showTicketUrl = false,
  value: externalValue,
  onChange: externalOnChange,
  extraFields
}: SeoMetadataBlockProps) {
  const [internalValue, setInternalValue] = useState<SeoBlockValue>(defaultValue);
  const [ticketUrlTouched, setTicketUrlTouched] = useState(false);
  const [ticketUrlError, setTicketUrlError] = useState('');

  const validateTicketUrl = (val: string) => {
    if (!val.trim()) return 'Обовʼязкове поле';
    try {
      new URL(val);
      return '';
    } catch {
      return 'Некоректний URL';
    }
  };

  const handleTicketUrlChange = (val: string) => {
    handleChange({ ...value, ticketUrl: val });
    if (ticketUrlTouched) setTicketUrlError(validateTicketUrl(val));
  };

  const handleTicketUrlBlur = () => {
    setTicketUrlTouched(true);
    setTicketUrlError(validateTicketUrl(value.ticketUrl ?? ''));
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
          value={value.ticketUrl ?? ''}
          onChange={(e) => handleTicketUrlChange(e.target.value)}
          onBlur={handleTicketUrlBlur}
          error={ticketUrlTouched && Boolean(ticketUrlError)}
          helperText={ticketUrlTouched && ticketUrlError ? ticketUrlError : ''}
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
        onImageChange={(file) => handleChange({ ...value, ogImage: file })}
        allowIndexing={value.allowIndexing.uk}
        onIndexingChange={(val) => handleChange({ ...value, allowIndexing: { ...value.allowIndexing, uk: val } })}
        showAlternativeText={showAlternativeText}
        extraFields={(localeMeta, onLocaleMeta) => buildExtraFields('uk', localeMeta, onLocaleMeta)}
      />
      <SeoMetadataForm
        value={value.meta.en}
        onChange={(newMeta) => handleChange({ ...value, meta: { ...value.meta, en: newMeta } })}
        locale="en"
        ogImage={value.ogImage}
        onImageChange={(file) => handleChange({ ...value, ogImage: file })}
        allowIndexing={value.allowIndexing.en}
        onIndexingChange={(val) => handleChange({ ...value, allowIndexing: { ...value.allowIndexing, en: val } })}
        showAlternativeText={showAlternativeText}
        extraFields={(localeMeta, onLocaleMeta) => buildExtraFields('en', localeMeta, onLocaleMeta)}
      />
    </Box>
  );
}
