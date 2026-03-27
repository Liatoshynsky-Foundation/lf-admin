'use client';

import 'dayjs/locale/uk';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Checkbox, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useState } from 'react';

import { styles } from './SeoMetadataForm.styles';
import { ImagePreviewBlock as PhotoBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import TooltipCustom from '~/shared/components/design-system/tooltip/Tooltip';

export interface LocalizedMeta {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
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
  readonly labels?: {
    readonly metaTitle?: string;
    readonly metaDescription?: string;
    readonly metaKeywords?: string;
    readonly canonicalUrl?: string;
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
  showCanonicalUrl = false,
  showAlternativeText = false,
  showDatatimePickers = false,
  labels = {}
}: SeoMetadataFormProps) {
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(typeof ogImage === 'string' ? ogImage : null);

  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);

  const [touched, setTouched] = useState<{ [K in keyof LocalizedMeta]?: boolean }>({});
  const [errors, setErrors] = useState<{ [K in keyof LocalizedMeta]?: string }>({});

  const validateTitle = (val: string) => (val.trim() ? '' : 'Обовʼязкове поле');
  const validateDescription = (val: string) => (val.trim() ? '' : 'Обовʼязкове поле');
  const validateCanonicalUrl = (val: string) => {
    if (!val) return '';
    try {
      new URL(val);
      return '';
    } catch {
      return 'Некоректний URL';
    }
  };
  const validateKeywords = (val: string) => {
    if (!val) return '';
    return val.split(',').some((word) => !word.trim())
      ? 'Ключові слова мають бути через кому, без порожніх значень'
      : '';
  };

  const validateField = (field: keyof LocalizedMeta, val: string) => {
    switch (field) {
    case 'title':
      return validateTitle(val);
    case 'description':
      return validateDescription(val);
    case 'canonicalUrl':
      return validateCanonicalUrl(val);
    case 'keywords':
      return validateKeywords(val);
    default:
      return '';
    }
  };

  const handleBlur = (field: keyof LocalizedMeta) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value[field] || '');
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleFieldChange = (field: keyof LocalizedMeta, val: string) => {
    onChange({ ...value, [field]: val });
    if (touched[field]) {
      const err = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleImageChange = (file: File) => {
    setOgImagePreview(URL.createObjectURL(file));
    onImageChange(file);
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="h6" sx={styles.sectionTitle}>
        {labels.sectionTitle || `Мета дані сторінки | ${locale.toUpperCase()}`}
      </Typography>
      <Stack sx={styles.formFields}>
        <TextField
          label={labels.metaTitle || 'Meta title'}
          value={value.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          error={Boolean(errors.title)}
          helperText={errors.title && touched.title ? errors.title : ''}
          fullWidth
          margin="normal"
          sx={styles.textField}
          required
        />
        <TextField
          label={labels.metaDescription || 'Meta description'}
          value={value.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          error={Boolean(errors.description)}
          helperText={errors.description && touched.description ? errors.description : ''}
          fullWidth
          margin="normal"
          required
          multiline
          minRows={2}
          sx={styles.textField}
        />
        {showCanonicalUrl && (
          <TextField
            label={labels.canonicalUrl || 'Canonical URL'}
            value={value.canonicalUrl || ''}
            onChange={(e) => handleFieldChange('canonicalUrl', e.target.value)}
            onBlur={() => handleBlur('canonicalUrl')}
            error={Boolean(errors.canonicalUrl)}
            helperText={errors.canonicalUrl && touched.canonicalUrl ? errors.canonicalUrl : ''}
            fullWidth
            margin="normal"
            sx={styles.textField}
          />
        )}
        <TextField
          label={labels.metaKeywords || 'Meta keywords'}
          value={value.keywords}
          onChange={(e) => handleFieldChange('keywords', e.target.value)}
          onBlur={() => handleBlur('keywords')}
          error={Boolean(errors.keywords)}
          helperText={errors.keywords && touched.keywords ? errors.keywords : ''}
          fullWidth
          margin="normal"
          sx={styles.textField}
        />
        {showDatatimePickers && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ width: '45%' }}>
                  <DesktopDateTimePicker
                    label="Початок події"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    ampm={false}
                    slotProps={{
                      popper: {
                        sx: {
                          '& .MuiMultiSectionDigitalClockSection-item.Mui-selected': {
                            backgroundColor: '#FCBD28',
                            color: '#190D03'
                          }
                        }
                      },
                      day: {
                        sx: {
                          '&.MuiPickersDay-root.Mui-selected': {
                            backgroundColor: '#FCBD28',
                            color: '#190D03'
                          }
                        }
                      },
                      textField: {
                        sx: {
                          '& label': {
                            sx: styles.datetimePickerLabel
                          },
                          width: { sm: '200px', xl: '223px' }
                        },
                        InputProps: {
                          sx: styles.dateTimePicker
                        }
                      }
                    }}
                  />{' '}
                </Box>
                <Box
                  sx={{
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '10%'
                  }}
                >
                  —
                </Box>
                <Box sx={{ width: '45%' }}>
                  <DesktopDateTimePicker
                    label="Закінчення події"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    ampm={false}
                    slotProps={{
                      popper: {
                        sx: {
                          '& .MuiMultiSectionDigitalClockSection-item.Mui-selected': {
                            backgroundColor: '#FCBD28',
                            color: '#190D03'
                          }
                        }
                      },
                      day: {
                        sx: {
                          '&.MuiPickersDay-root.Mui-selected': {
                            backgroundColor: '#FCBD28',
                            color: '#190D03'
                          }
                        }
                      },
                      textField: {
                        sx: {
                          '& label': {
                            sx: styles.datetimePickerLabel
                          },
                          width: { sm: '200px', xl: '223px' }
                        },
                        InputProps: {
                          sx: styles.dateTimePicker
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
            </LocalizationProvider>
          </Box>
        )}
      </Stack>
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
