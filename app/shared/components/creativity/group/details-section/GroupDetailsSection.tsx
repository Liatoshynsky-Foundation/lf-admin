import { Box, Divider, MenuItem, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { styles } from './GroupDetailsSection.styles';
import { GroupDataField } from '~/constants/creativity';
import {
  OPUS_DETAILS_LABELS,
  OPUS_FIELD_LIMITS,
  OPUS_NUMBER_KIND_OPTIONS,
  OPUS_VALIDATION_MESSAGES,
  REQUIRED_FIELD_ERROR
} from '~/constants/opus';
import { EditorLanguage } from '~/constants/publications';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import YearPicker from '~/shared/components/forms/opus-details-block/year-picker/YearPicker';

type MultilingualText = { uk: string; en: string };

type GroupDetailsSectionProps = {
  data: {
    titlePrefix: string;
    groupNumber: string;
    additionalText: string;
    groupTitle: MultilingualText;
    creationYear: string;
    endYear: string;
    dateAdditionalText: string;
    genre: MultilingualText;
  };
  currentLanguage: EditorLanguage;
  errors: Record<string, string>;
  onChange: (field: GroupDataField, value: string, isMultilingual?: boolean) => void;
};

export const GroupDetailsSection = ({ data, currentLanguage, errors, onChange }: GroupDetailsSectionProps) => {
  const langKey = (currentLanguage === 'UA' ? 'uk' : 'en') as 'uk' | 'en';
  const [isPrefixMenuOpen, setIsPrefixMenuOpen] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isGroupNumberEmpty = !data.groupNumber || data.groupNumber.toString().trim() === '';
  const isGroupNumberNegative = Number(data.groupNumber) < 0;

  const titlePrefixError = (touched.titlePrefix && !data.titlePrefix) || Boolean(errors.titlePrefix);
  const groupNumberError =
    (touched.groupNumber && (isGroupNumberEmpty || isGroupNumberNegative)) || Boolean(errors.groupNumber);
  const groupTitleError =
    (touched.groupTitle && (!data.groupTitle[langKey] || data.groupTitle[langKey].trim() === '')) ||
    Boolean(errors[`groupTitle.${langKey}`]);
  const creationYearError = (touched.creationYear && !data.creationYear) || Boolean(errors.creationYear);

  const getGroupNumberErrorMessage = () => {
    if (errors.groupNumber) return errors.groupNumber;
    if (isGroupNumberNegative) return OPUS_VALIDATION_MESSAGES.numberInvalid;
    return OPUS_VALIDATION_MESSAGES.numberRequired;
  };

  useEffect(() => {
    if (!isPrefixMenuOpen) return;

    const handleScroll = () => {
      setIsPrefixMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { capture: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isPrefixMenuOpen]);

  return (
    <Box sx={styles.mainContainer}>
      <Box sx={styles.headerRow}>
        <Typography variant="body2" sx={styles.typographyTitle} color="text.secondary">
          Поля заповняються автоматично
        </Typography>

        <Divider sx={styles.divider} />
      </Box>

      <Box sx={styles.topRow}>
        <Box sx={{ flex: 3 }}>
          <CustomTextField
            select
            label={OPUS_DETAILS_LABELS.numberKind}
            value={data.titlePrefix || ''}
            onChange={(e) => onChange('titlePrefix', e.target.value)}
            onBlur={() => handleBlur('titlePrefix')}
            required
            fullWidth
            error={titlePrefixError}
            helperText={titlePrefixError ? errors.titlePrefix || REQUIRED_FIELD_ERROR : ''}
            SelectProps={{
              open: isPrefixMenuOpen,
              onOpen: () => setIsPrefixMenuOpen(true),
              onClose: () => setIsPrefixMenuOpen(false),
              MenuProps: { disableScrollLock: true },
              IconComponent: () => null
            }}
            sx={styles.selectField}
          >
            {OPUS_NUMBER_KIND_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </CustomTextField>
        </Box>
        <Box sx={{ flex: 3 }}>
          <CustomTextField
            type="number"
            label={OPUS_DETAILS_LABELS.number}
            value={data.groupNumber !== undefined && data.groupNumber !== null ? String(data.groupNumber) : ''}
            onChange={(e) => onChange('groupNumber', e.target.value)}
            required
            fullWidth
            error={groupNumberError}
            helperText={groupNumberError ? getGroupNumberErrorMessage() : ''}
            onBlur={() => handleBlur('groupNumber')}
            sx={styles.numberField}
          />
        </Box>
        <Box sx={{ flex: 4 }}>
          <CustomTextField
            label={OPUS_DETAILS_LABELS.additionalText}
            value={data.additionalText}
            onChange={(e) => onChange('additionalText', e.target.value)}
            onBlur={() => onChange('additionalText', data.additionalText.trim())}
            fullWidth
            inputProps={{ 'data-testid': 'mock-input-additionalText-top', maxLength: OPUS_FIELD_LIMITS.additionalText }}
          />
        </Box>
      </Box>

      <CustomTextField
        label={OPUS_DETAILS_LABELS.name}
        value={data.groupTitle[langKey]}
        onChange={(e) => onChange('groupTitle', e.target.value, true)}
        required
        fullWidth
        error={groupTitleError}
        helperText={groupTitleError ? errors[`groupTitle.${langKey}`] || OPUS_VALIDATION_MESSAGES.nameRequired : ''}
        onBlur={() => handleBlur('groupTitle')}
        inputProps={{ maxLength: OPUS_FIELD_LIMITS.name.max }}
      />

      <Box sx={styles.bottomRow}>
        <Box sx={styles.datesContainer}>
          <YearPicker
            label={`${OPUS_DETAILS_LABELS.creationYear} *`}
            value={data.creationYear}
            onChange={(year: string) => {
              onChange('creationYear', year);
              handleBlur('creationYear');
            }}
            error={creationYearError}
            helperText={creationYearError ? OPUS_VALIDATION_MESSAGES.creationYearRequired : ''}
            sx={{ flex: 1 }}
          />

          <Box sx={styles.dashWrapper}>
            <Typography>-</Typography>
          </Box>

          <YearPicker
            label={OPUS_DETAILS_LABELS.endYear}
            value={data.endYear}
            onChange={(year: string) => {
              onChange('endYear', year);
            }}
            sx={{ flex: 1 }}
          />
        </Box>

        <Box sx={{ flex: 2.5 }}>
          <CustomTextField
            label={OPUS_DETAILS_LABELS.datesNote}
            value={data.dateAdditionalText}
            onChange={(e) => onChange('dateAdditionalText', e.target.value)}
            onBlur={() => onChange('dateAdditionalText', (data.dateAdditionalText || '').trim())}
            fullWidth
            inputProps={{ 'data-testid': 'mock-input-dateAdditionalText', maxLength: OPUS_FIELD_LIMITS.datesNote }}
          />
        </Box>

        <Box sx={{ flex: 4 }}>
          <CustomTextField
            label={OPUS_DETAILS_LABELS.genre}
            value={data.genre[langKey] ?? ''}
            onChange={(e) => onChange('genre', e.target.value, true)}
            onBlur={() => {
              const trimmedValue = (data.genre[langKey] || '').trim();
              if (trimmedValue !== data.genre[langKey]) {
                onChange('genre', trimmedValue, true);
              }
            }}
            fullWidth
            inputProps={{
              maxLength: OPUS_FIELD_LIMITS.genre
            }}
            error={!!errors.genre}
            helperText={errors.genre}
          />
        </Box>
      </Box>
    </Box>
  );
};
