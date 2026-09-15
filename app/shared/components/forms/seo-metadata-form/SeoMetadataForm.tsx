'use client';

import 'dayjs/locale/uk';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Checkbox, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { isSeoFieldRequired, SeoBaseFields, type SeoFieldsRequired } from './seo-base-fields/SeoBaseFields';
import { styles } from './SeoMetadataForm.styles';
import { type SeoField, validateSeoField } from './validateSeoField';
import { seoFormErrors } from '~/constants/errors';
import { CROP_RATIOS } from '~/constants/publications';
import { isValidHttpUrl } from '~/lib/utils/isValidUrl';
import { ImagePreviewBlock as PhotoBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import TooltipCustom from '~/shared/components/design-system/tooltip/Tooltip';
import { fileNameFromUrl } from '~/src/shared/utils/assets/assetFilename';
import { CropRect, CropResult } from '~/types/common';

export type { SeoFieldsRequired };

export interface LocalizedMeta {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
  startDateTime?: string;
  endDateTime?: string;
  altText?: { uk: string; en: string };
}

export type SeoFormLabels = {
  readonly metaTitle?: string;
  readonly metaDescription?: string;
  readonly metaKeywords?: string;
  readonly ogImage?: string;
  readonly ogImageHint?: string;
  readonly allowIndexing?: string;
  readonly sectionTitle?: string;
  readonly alternativeText?: string;
  readonly ticketUrl?: string;
  readonly fileNameLabel?: string;
  readonly editImageLabel?: string;
  readonly changeImageLabel?: string;
};

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
  readonly required?: SeoFieldsRequired;
  readonly forceShowErrors?: boolean;
  readonly errors?: Partial<Record<keyof LocalizedMeta, string>>;
  readonly extraFields?: (value: LocalizedMeta, onChange: (val: LocalizedMeta) => void) => ReactNode;
  readonly crop?: CropRect | null;
  readonly onChangeCrop?: (crop: CropRect | null) => void;
  readonly labels?: SeoFormLabels;
}

const getFileNameFromUrl = (url: string | null): string | undefined =>
  url ? url.split('/').pop()?.split('?')[0] : undefined;

const seoFields = new Set<SeoField>(['title', 'description', 'keywords', 'canonicalUrl', 'altText']);

const getSeoFieldError = (
  field: keyof LocalizedMeta,
  value: string,
  locale: 'uk' | 'en',
  required: SeoFieldsRequired,
  options: { altRequired?: boolean } = {}
): string => {
  if (!seoFields.has(field as SeoField)) return '';

  let fieldRequired = Boolean(value.trim());

  if (field === 'title' || field === 'description') {
    fieldRequired = isSeoFieldRequired(required, field) || Boolean(value.trim());
  }

  if (field === 'altText') {
    fieldRequired = Boolean(options.altRequired) || Boolean(value.trim());
  }

  const error = validateSeoField(field as SeoField, value, { required: fieldRequired });
  return error ? seoFormErrors[locale][error] : '';
};

const shouldShowAltFieldError = ({
  forceShowErrors,
  touched,
  altValue,
  nextError,
  altRequired
}: {
  forceShowErrors: boolean;
  touched: boolean;
  altValue: string;
  nextError: string;
  altRequired: boolean;
}): boolean =>
  forceShowErrors || touched || Boolean(altValue && nextError) || (altRequired && !altValue.trim());

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
  required = true,
  forceShowErrors = false,
  errors: externalErrors,
  crop,
  onChangeCrop,
  extraFields,
  labels = {}
}: SeoMetadataFormProps) {
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(isValidHttpUrl(ogImage) ? ogImage : null);
  const [displayFileName, setDisplayFileName] = useState<string | undefined>(
    isValidHttpUrl(ogImage) ? getFileNameFromUrl(ogImage) : undefined
  );
  const [isUploading, setIsUploading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof LocalizedMeta, boolean>>>({});
  const [localErrors, setLocalErrors] = useState<Partial<Record<keyof LocalizedMeta, string>>>({});
  const isExternalValidation = externalErrors !== undefined;
  const [displayErrors, setDisplayErrors] = useState(externalErrors);
  const errors = isExternalValidation ? (displayErrors ?? {}) : localErrors;
  const hasCoverImage = isValidHttpUrl(ogImage);

  useEffect(() => {
    if (isValidHttpUrl(ogImage)) {
      setOgImagePreview(ogImage);
      setDisplayFileName(getFileNameFromUrl(ogImage));
    } else {
      setOgImagePreview(null);
      setDisplayFileName(undefined);
    }
  }, [ogImage]);

  useEffect(() => {
    setDisplayErrors(externalErrors);
  }, [externalErrors]);

  useEffect(() => {
    if (!forceShowErrors || isExternalValidation) return;
    setTouched({ title: true, description: true, keywords: true, altText: true });
    setLocalErrors({
      title: getSeoFieldError('title', value.title, locale, required),
      description: getSeoFieldError('description', value.description, locale, required),
      keywords: getSeoFieldError('keywords', value.keywords, locale, required),
      altText: getSeoFieldError('altText', value.altText?.[locale] ?? '', locale, required, {
        altRequired: hasCoverImage
      })
    });
  }, [
    forceShowErrors,
    hasCoverImage,
    isExternalValidation,
    locale,
    required,
    value.altText,
    value.description,
    value.keywords,
    value.title
  ]);

  useEffect(() => {
    if (!showAlternativeText) return;

    const altVal = value.altText?.[locale] ?? '';
    const nextError = getSeoFieldError('altText', altVal, locale, required, {
      altRequired: hasCoverImage
    });
    const shouldShow = shouldShowAltFieldError({
      forceShowErrors,
      touched: Boolean(touched.altText),
      altValue: altVal,
      nextError,
      altRequired: hasCoverImage
    });

    if (!shouldShow) return;

    setTouched((prev) => (prev.altText ? prev : { ...prev, altText: true }));

    if (isExternalValidation) {
      setDisplayErrors((previous) => (previous?.altText === nextError ? previous : { ...previous, altText: nextError }));
    } else {
      setLocalErrors((prev) => (prev.altText === nextError ? prev : { ...prev, altText: nextError }));
    }
  }, [
    forceShowErrors,
    hasCoverImage,
    isExternalValidation,
    locale,
    required,
    showAlternativeText,
    touched.altText,
    value.altText
  ]);

  const handleBlur = (field: keyof LocalizedMeta) => {
    if (isExternalValidation) return;
    setTouched((prev) => ({ ...prev, [field]: true }));
    let fieldValue = '';
    if (field === 'altText') {
      fieldValue = value.altText?.[locale] ?? '';
    } else if (typeof value[field] === 'string') {
      fieldValue = value[field];
    }
    setLocalErrors((prev) => ({
      ...prev,
      [field]: getSeoFieldError(field, fieldValue, locale, required, { altRequired: hasCoverImage })
    }));
  };

  const handleFieldChange = (field: keyof LocalizedMeta, val: string) => {
    onChange({ ...value, [field]: val });
    if (isExternalValidation) {
      setDisplayErrors((previous) => ({ ...previous, [field]: '' }));
    } else if (touched[field]) {
      setLocalErrors((prev) => ({
        ...prev,
        [field]: getSeoFieldError(field, val, locale, required, { altRequired: hasCoverImage })
      }));
    }
  };

  const handleAltTextChange = (val: string) => {
    const nextValue = {
      ...value,
      altText: { uk: val, en: val }
    };

    onChange(nextValue);
    if (isExternalValidation) {
      setDisplayErrors((previous) => ({ ...previous, altText: '' }));
    } else if (touched.altText) {
      setLocalErrors((prev) => ({
        ...prev,
        altText: getSeoFieldError('altText', val, locale, required, { altRequired: hasCoverImage })
      }));
    }
  };

  const handleImageChange = async (url: string, crop: CropResult | null | undefined) => {
    setIsUploading(true);
    setOgImagePreview(url);
    setDisplayFileName(fileNameFromUrl(url) || 'image');

    onImageChange(url);
    onChangeCrop?.(crop?.rect ?? null);

    setIsUploading(false);
  };

  const renderPhotoBlock = () => (
    <Stack sx={styles.photoBlock}>
      <Box sx={styles.photoBlockHeader}>
        <Typography variant="subtitle2" sx={styles.photoBlockTitle}>
          {labels.ogImage || 'Зображення для соцмереж'}
        </Typography>
        <Divider sx={styles.photoBlockHeaderDivider} />
      </Box>
      <PhotoBlock
        imageUrl={ogImagePreview || ''}
        fileName={displayFileName}
        onChangeImage={handleImageChange}
        aspectRatio={CROP_RATIOS.GROUP_PHOTO}
        disabled={isUploading}
        buttonSpacing="8px"
        stackSpacing="16px"
        typographySpacing="4px"
        direction="column"
        initialCrop={crop ? { rect: crop } : null}
        showAlternativeText={showAlternativeText}
        altText={value.altText?.[locale] ?? ''}
        onChangeAltText={handleAltTextChange}
        onBlurAltText={() => handleBlur('altText')}
        altTextErrorState={Boolean(errors.altText && (isExternalValidation || touched.altText))}
        altTextError={errors.altText && (isExternalValidation || touched.altText) ? errors.altText : ''}
        locale={locale}
        alternativeTextLabel={labels.alternativeText}
        alternativeTextRequired={hasCoverImage}
        fileNameLabel={labels.fileNameLabel}
        editImageLabel={labels.editImageLabel}
        changeImageLabel={labels.changeImageLabel}
      />
      <Typography variant="textMd" sx={styles.ogImageHint}>
        {labels.ogImageHint || 'Оптимальний розмір: 1200×630 px.'}
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
          touched={isExternalValidation ? undefined : touched}
          onFieldChange={handleFieldChange}
          onBlur={handleBlur}
          showKeywords={!extraFieldsBeforeKeywords}
          required={required}
          labels={labels}
        />
        {extraFields?.(value, onChange)}
        {extraFieldsBeforeKeywords && (
          <TextField
            label={labels.metaKeywords || 'Meta keywords'}
            value={value.keywords || ''}
            onChange={(e) => handleFieldChange('keywords', e.target.value)}
            onBlur={() => handleBlur('keywords')}
            error={Boolean(errors.keywords && (isExternalValidation || touched.keywords))}
            helperText={errors.keywords && (isExternalValidation || touched.keywords) ? errors.keywords : ''}
            fullWidth
            sx={styles.textField}
            multiline
            minRows={2}
            maxRows={2}
          />
        )}
      </Stack>
      {renderPhotoBlock()}
      <Divider sx={styles.divider} />
      <Box sx={styles.indexingCheckboxContainer}>
        <FormControlLabel
          label={'Дозволити індексацію сторінки пошуковими системами'}
          control={<Checkbox checked={allowIndexing} onChange={(e) => onIndexingChange(e.target.checked)} />}
          sx={styles.indexingCheckbox}
        />
        <TooltipCustom title={labels.allowIndexing || 'Дозволити індексацію сторінки пошуковими системами'}>
          <InfoOutlinedIcon sx={styles.infoIcon} />
        </TooltipCustom>
      </Box>
    </Box>
  );
}
