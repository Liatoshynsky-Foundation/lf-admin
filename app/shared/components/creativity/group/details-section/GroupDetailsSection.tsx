import { Box, Divider, MenuItem, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

import { styles } from './GroupDetailsSection.styles';
import { GroupDataField } from '~/constants/creativity';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';


type MultilingualText = { uk: string; en: string };

type GroupDetailsSectionProps = {
  data: {
    titlePrefix: string;
    groupNumber: string;
    additionalText: string;
    groupTitle: MultilingualText;
    creationYear: string;
    endYear: string;
    dateAdditionalText: MultilingualText;
  };
  derivedGenre: string;
  currentLanguage: string;
  errors: Record<string, string>;
  onChange: (field: GroupDataField, value: string, isMultilingual?: boolean) => void;
};

export const GroupDetailsSection = ({ data, derivedGenre, currentLanguage, errors, onChange }: GroupDetailsSectionProps) => {
  const langKey = (currentLanguage === 'UA' ? 'uk' : 'en') as 'uk' | 'en';
  const [isPrefixMenuOpen, setIsPrefixMenuOpen] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const titlePrefixError = (touched.titlePrefix && !data.titlePrefix) || Boolean(errors.titlePrefix);
  const groupNumberError = (touched.groupNumber && (!data.groupNumber || data.groupNumber.toString().trim() === '')) || Boolean(errors.groupNumber);
  const groupTitleError = (touched.groupTitle && (!data.groupTitle[langKey] || data.groupTitle[langKey].trim() === '')) || Boolean(errors.groupTitle);
  const creationYearError = (touched.creationYear && !data.creationYear) || Boolean(errors.creationYear); 

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
    <CollapsibleBlock title="Деталі" defaultExpanded>
      <Box sx={styles.mainContainer}>
        <Box sx={styles.headerRow}>
          <Typography
            variant="body2"
            sx={styles.typographyTitle}
            color="text.secondary"
          >
            Поля заповняються автоматично
          </Typography>

          <Divider sx={styles.divider} />
        </Box>

        <Box sx={styles.topRow}>
          <Box sx={{ flex: 3 }}>
            <CustomTextField
              select
              label="Назва"
              value={data.titlePrefix || ''}
              onChange={(e) => onChange('titlePrefix', e.target.value)}
              onBlur={() => handleBlur('titlePrefix')}
              required
              fullWidth
              error={titlePrefixError}
              helperText={titlePrefixError ? (errors.titlePrefix || 'Обов’язкове поле') : ''}
              SelectProps={{
                open: isPrefixMenuOpen,
                onOpen: () => setIsPrefixMenuOpen(true),
                onClose: () => setIsPrefixMenuOpen(false),
                MenuProps: { disableScrollLock: true },
                IconComponent: () => null
              }}
              sx={styles.selectField}
            >
              <MenuItem value="Op.">Op.</MenuItem>
              <MenuItem value="Bo.">B/o.</MenuItem>
            </CustomTextField>
          </Box>
          <Box sx={{ flex: 3 }}>
            <CustomTextField
              type="number"
              label="Номер"
              value={data.groupNumber}
              onChange={(e) => onChange('groupNumber', e.target.value)}
              required
              fullWidth
              error={groupNumberError}
              helperText={groupNumberError ? (errors.groupNumber || 'Обов’язкове поле') : ''}
              onBlur={() => handleBlur('groupNumber')}
              sx={styles.numberField}
            />
          </Box>
          <Box sx={{ flex: 4 }}>
            <CustomTextField
              label="Додатковий текст"
              value={data.additionalText}
              onChange={(e) => onChange('additionalText', e.target.value)}
              fullWidth
              inputProps={{ 'data-testid': 'mock-input-additionalText-top' }}
            />
          </Box>
        </Box>

        <CustomTextField
          label="Назва групи"
          value={data.groupTitle[langKey]}
          onChange={(e) => onChange('groupTitle', e.target.value, true)}
          required
          fullWidth
          error={groupTitleError}
          helperText={groupTitleError ? (errors.groupTitle || 'Обов’язкове поле') : ''}
          onBlur={() => handleBlur('groupTitle')}
        />

        <Box sx={styles.bottomRow}>
          <Box sx={styles.datesContainer}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ flex: 1 }}>
                <DatePicker
                  label="Рік створення"
                  views={['year']}
                  value={data.creationYear ? dayjs(data.creationYear) : null}
                  onChange={(newValue: Dayjs | null) => {
                    onChange('creationYear', newValue ? newValue.format('YYYY') : '');
                  }}
                  slotProps={{
                    textField: {
                      sx: styles.datePickerInput,
                      required: true,
                      error: creationYearError,
                      helperText: creationYearError ? (errors.creationYear || 'Обов’язкове поле') : '',
                      onBlur: () => handleBlur('creationYear')
                    }
                  }}
                />
              </Box>
              
              <Box sx={styles.dashWrapper}>
                <Typography>-</Typography>
              </Box>

              <Box sx={{ flex: 1 }}>
                <DatePicker
                  label="Рік закінчення"
                  views={['year']}
                  value={data.endYear ? dayjs(data.endYear) : null}
                  onChange={(newValue: Dayjs | null) => {
                    onChange('endYear', newValue ? newValue.format('YYYY') : '');
                  }}
                  slotProps={{
                    textField: {
                      sx: styles.datePickerInput
                    }
                  }}
                />
              </Box>
            </LocalizationProvider>
          </Box>

          <Box sx={{ flex: 2.5 }}>
            <CustomTextField
              label="Додатковий текст"
              value={data.dateAdditionalText[langKey]}
              onChange={(e) => onChange('dateAdditionalText', e.target.value, true)}
              fullWidth
              inputProps={{ 'data-testid': 'mock-input-dateAdditionalText' }}
            />
          </Box>

          <Box sx={{ flex: 4 }}>
            <CustomTextField
              label="Жанр"
              value={derivedGenre || 'Жанри відсутні'}
              fullWidth
              InputProps={{
                readOnly: true,
                sx: styles.readOnlyInput
              }}
            />
          </Box>
        </Box>
      </Box>
    </CollapsibleBlock>
  );
};
