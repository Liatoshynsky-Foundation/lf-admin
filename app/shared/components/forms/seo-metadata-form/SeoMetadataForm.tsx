'use client';

import 'dayjs/locale/uk';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Checkbox, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { SeoBaseFields } from './seo-base-fields/SeoBaseFields';
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
  altText?: { uk: string; en: string };
}

export interface SeoMetadataFormProps {
  readonly value: LocalizedMeta;
  readonly onChange: (value: LocalizedMeta) => void;
  readonly locale: 'uk' | 'en';
  readonly ogImage: string | null;
  readonly onImageChange: (url: string) => void;
  readonly allowIndexing: boolean;
  readonly onIndexingChange: (val: boolean) => void;
  readonly showAlternativeText?: boolean;
  readonly extraFieldsBeforeKeywords?: boolean;
  readonly forceShowErrors?: boolean;
  readonly extraFields?: (value: LocalizedMeta, onChange: (val: LocalizedMeta) => void) => ReactNode;
  readonly labels?: {
    readonly metaTitle?: string;
    readonly metaDescription?: string;
    readonly metaKeywords?: string;
    readonly ogImage?: string;
    readonly ogImageHint?: string;
    readonly allowIndexing?: string;
    readonly sectionTitle?: string;
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
  showAlternativeText = false,
  extraFieldsBeforeKeywords = false,
  forceShowErrors = false,
  extraFields,
  labels = {}
}: SeoMetadataFormProps) {
  const getFileNameFromUrl = (url: string | null) =>
    url ? url.split('/').pop()?.split('?')[0] : undefined;

  const [ogImagePreview, setOgImagePreview] = useState<string | null>(typeof ogImage === 'string' ? ogImage : null);
  const [displayFileName, setDisplayFileName] = useState<string | undefined>(getFileNameFromUrl(ogImage));
  const [isUploading, setIsUploading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof LocalizedMeta, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof LocalizedMeta, string>>>({});

  useEffect(() => {
    if (!forceShowErrors) return;
    setTouched((prev) => ({ ...prev, title: true, description: true }));
    setErrors((prev) => ({
      ...prev,
      title: validateField('title', value.title),
      description: validateField('description', value.description)
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceShowErrors]);

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
    const fieldValue = typeof value[field] === 'string' ? value[field] : '';
    setErrors((prev) => ({ ...prev, [field]: validateField(field, fieldValue) }));
  };

  const handleFieldChange = (field: keyof LocalizedMeta, val: string) => {
    onChange({ ...value, [field]: val });
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
  };

  const handleImageChange = async (file: File) => {
    setIsUploading(true);
    setDisplayFileName(file.name);
    setOgImagePreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', 'photos');
    const res = await fetch('/api/uploads/single', { method: 'POST', body: formData });
    const json = await res.json();
    if (json.success) {
      setOgImagePreview(json.data.url);
      onImageChange(json.data.url);
    } else {
      toast.error('Непідтримуваний формат файлу');
      setOgImagePreview(null);
      setDisplayFileName(undefined);
    }
    setIsUploading(false);
  };

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
        fileName={displayFileName}
        onChangeImage={handleImageChange}
        disabled={isUploading}
        buttonSpacing="8px"
        stackSpacing="0"
        typographySpacing="4px"
        direction="column"
        showAlternativeText={showAlternativeText}
        altText={value.altText?.[locale] ?? ''}
        onChangeAltText={(alt) =>
          onChange({
            ...value,
            altText: {
              uk: locale === 'uk' ? alt : (value.altText?.uk ?? ''),
              en: locale === 'en' ? alt : (value.altText?.en ?? '')
            }
          })
        }
      />
      <Typography variant="body2" sx={styles.ogImageHint}>
        {'Оптимальний розмір: 1200×630 px.'}
      </Typography>
    </Stack>
  );

  return (
    <Box sx={styles.container}>
      <Typography variant="h6" sx={styles.sectionTitle}>
        {labels.sectionTitle || `Мета дані сторінки | ${locale === 'uk' ? 'UA' : 'EN'}`}
      </Typography>
      <Stack sx={styles.formFieldsContainer}>
        <SeoBaseFields
          value={value}
          errors={errors}
          touched={touched}
          onFieldChange={handleFieldChange}
          onBlur={handleBlur}
          showKeywords={!extraFieldsBeforeKeywords}
          labels={labels}
        />
        {extraFields?.(value, onChange)}
        {extraFieldsBeforeKeywords && (
          <TextField
            label={labels.metaKeywords || 'Meta keywords'}
            value={value.keywords || ''}
            onChange={(e) => handleFieldChange('keywords', e.target.value)}
            onBlur={() => handleBlur('keywords')}
            error={Boolean(errors.keywords && touched.keywords)}
            helperText={errors.keywords && touched.keywords ? errors.keywords : ''}
            fullWidth
            sx={styles.textField}
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
              color: '#52545A',
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
