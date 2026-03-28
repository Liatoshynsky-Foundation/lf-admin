'use client';

import 'dayjs/locale/uk';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Checkbox, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import DateTimePicker from './date-time-picker/DateTimePicker';
import { styles } from './SeoMetadataForm.styles';
import { ImagePreviewBlock as PhotoBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import TooltipCustom from '~/shared/components/design-system/tooltip/Tooltip';

export interface LocalizedMeta {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
  startDateTime?: string;
  endDateTime?: string;
}

export interface SeoMetadataFormProps {
  readonly value: LocalizedMeta;
  readonly onChange: (value: LocalizedMeta) => void;
  readonly locale: 'ua' | 'en';
  readonly ogImage: File | string | null;
  readonly onImageChange: (file: File) => void;
  readonly allowIndexing: boolean;
  readonly onIndexingChange: (val: boolean) => void;
  readonly showCanonicalUrl?: boolean;
  readonly showAlternativeText?: boolean;
  readonly showDatatimePickers?: boolean;
  readonly labels?: {
    readonly metaTitle?: string;
    readonly metaDescription?: string;
    readonly metaKeywords?: string;
    readonly canonicalUrl?: string;
    readonly ogImage?: string;
    readonly ogImageHint?: string;
    readonly allowIndexing?: string;
    readonly sectionTitle?: string;
    readonly startDateTime?: string;
    readonly endDateTime?: string;
  };
}

export default function SeoMetadataForm({
  value,
  onChange,
  locale,
  ogImage,
  onImageChange,
  allowIndexing,
  onIndexingChange,
  showCanonicalUrl = false,
  showAlternativeText = false,
  showDatatimePickers = false,
  labels = {}
}: SeoMetadataFormProps) {
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(typeof ogImage === 'string' ? ogImage : null);

  const [touched, setTouched] = useState<{ [K in keyof LocalizedMeta]?: boolean }>({});
  const [errors, setErrors] = useState<{ [K in keyof LocalizedMeta]?: string }>({});

  const validateField = (field: keyof LocalizedMeta, val: string) => {
    switch (field) {
    case 'title':
    case 'description':
      return val.trim() ? '' : 'Обовʼязкове поле';
    case 'canonicalUrl':
      if (!val) return '';
      try {
        new URL(val);
        return '';
      } catch {
        return 'Некоректний URL';
      }
    case 'keywords':
      if (!val) return '';
      return val.split(',').some((word) => !word.trim())
        ? 'Ключові слова мають бути через кому, без порожніх значень'
        : '';
    default:
      return '';
    }
  };

  const handleBlur = (field: keyof LocalizedMeta) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value[field] || '') }));
  };

  const handleFieldChange = (field: keyof LocalizedMeta, val: string) => {
    onChange({ ...value, [field]: val });
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
  };

  const handleImageChange = (file: File) => {
    setOgImagePreview(URL.createObjectURL(file));
    onImageChange(file);
  };

  const handleDateTimeChange = (start?: string, end?: string) => {
    onChange({ ...value, startDateTime: start, endDateTime: end });
  };

  const fields: Array<{
    key: keyof LocalizedMeta;
    label: string;
    required?: boolean;
    multiline?: boolean;
    minRows?: number;
  }> = [
    { key: 'title', label: labels.metaTitle || 'Meta title', required: true },
    {
      key: 'description',
      label: labels.metaDescription || 'Meta description',
      required: true,
      multiline: true,
      minRows: 2
    },
    showCanonicalUrl ? { key: 'canonicalUrl', label: labels.canonicalUrl || 'Canonical URL' } : null,
    { key: 'keywords', label: labels.metaKeywords || 'Meta keywords' }
  ].filter(Boolean) as Array<{
    key: keyof LocalizedMeta;
    label: string;
    required?: boolean;
    multiline?: boolean;
    minRows?: number;
  }>;

  const renderPhotoBlock = () => (
    <Stack sx={styles.photoBlock}>
      <Box sx={styles.photoBlockHeader}>
        <Typography variant="subtitle1" sx={styles.photoBlockTitle}>
          {'Зображення для соцмереж'}
        </Typography>
        <TooltipCustom title={'Зображення для соцмереж'}>
          <InfoOutlinedIcon sx={{ borderWidth: '1px', width: '16px', height: '16px' }} />
        </TooltipCustom>
        <Divider sx={styles.photoBlockHeaderDivider} />
      </Box>
      <PhotoBlock
        imageUrl={ogImagePreview || ''}
        fileName={typeof ogImage === 'string' ? ogImage : ogImage?.name}
        cropWidth={1200}
        cropHeight={630}
        onChangeImage={handleImageChange}
        title={labels.ogImage || 'Назва файлу зображення'}
        editorMode="mediaModal"
        showAlternativeText={showAlternativeText}
      />
      <Typography variant="body2" sx={styles.ogImageHint}>
        {'Оптимальний розмір: 1200×630 px.'}
      </Typography>
    </Stack>
  );

  return (
    <Box sx={styles.container}>
      <Typography variant="h6" sx={styles.sectionTitle}>
        {labels.sectionTitle || `Мета дані сторінки | ${locale.toUpperCase()}`}
      </Typography>
      <Stack sx={styles.formFields}>
        {fields.map(({ key, label, required, multiline, minRows }) => (
          <TextField
            key={key}
            label={label}
            value={value[key] || ''}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            onBlur={() => handleBlur(key)}
            error={Boolean(errors[key])}
            helperText={errors[key] && touched[key] ? errors[key] : ''}
            fullWidth
            margin="normal"
            sx={styles.textField}
            required={required}
            multiline={multiline}
            minRows={minRows}
          />
        ))}
        {showDatatimePickers && (
          <DateTimePicker
            startDateTime={value.startDateTime}
            endDateTime={value.endDateTime}
            onChange={handleDateTimeChange}
            labels={{ startDateTime: labels.startDateTime, endDateTime: labels.endDateTime }}
          />
        )}
      </Stack>
      {renderPhotoBlock()}
      <Divider sx={styles.divider} />
      <Box sx={styles.indexingCheckboxContainer}>
        <FormControlLabel
          label={'Дозволити індексацію сторінки пошуковими системами'}
          control={
            <Checkbox
              checked={allowIndexing}
              onChange={(e) => onIndexingChange(e.target.checked)}
              sx={styles.indexingCheckbox}
            />
          }
          sx={{
            '& .MuiFormControlLabel-label': {
              color: '#555',
              fontSize: '18px',
              fontWeight: 500,
              fontFamily: 'Mulish',
              lineHeight: '150%',
              letterSpacing: 0
            }
          }}
        />
        <TooltipCustom title={'Дозволити індексацію сторінки пошуковими системами'}>
          <InfoOutlinedIcon sx={{ borderWidth: '1px', width: '16px', height: '16px' }} />
        </TooltipCustom>
      </Box>
    </Box>
  );
}
