'use client';

import { Box, MenuItem, TextField } from '@mui/material';

import { GroupWorksSection } from '../../creativity/group/works-section/GroupWorksSection';
import { styles } from './OpusDetailsBlock.styles';
import YearPicker from './year-picker/YearPicker';
import { OPUS_DETAILS_LABELS, OPUS_FIELD_LIMITS, OPUS_NUMBER_KIND_OPTIONS } from '~/constants/opus';
import type { OpusDetailsErrors, OpusDetailsValue } from '~/types/opus';

interface OpusDetailsBlockProps {
  value: OpusDetailsValue;
  onChange: (updater: (prev: OpusDetailsValue) => OpusDetailsValue) => void;
  errors: OpusDetailsErrors;
}

export default function OpusDetailsBlock({ value, onChange, errors }: Readonly<OpusDetailsBlockProps>) {
  const updateField = <Key extends keyof OpusDetailsValue>(key: Key, fieldValue: OpusDetailsValue[Key]): void => {
    onChange((prev) => ({ ...prev, [key]: fieldValue }));
  };
  return (
    <Box sx={styles.container}>
      <Box sx={styles.fieldsRow}>
        <TextField
          select
          label={OPUS_DETAILS_LABELS.numberKind}
          value={value.numberKind}
          onChange={(event) => updateField('numberKind', event.target.value as OpusDetailsValue['numberKind'])}
          sx={styles.kindField}
          slotProps={{ select: { MenuProps: { disableScrollLock: true } } }}
        >
          {OPUS_NUMBER_KIND_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label={`${OPUS_DETAILS_LABELS.number} *`}
          value={value.number}
          onChange={(event) => updateField('number', event.target.value)}
          error={Boolean(errors.number)}
          helperText={errors.number}
          sx={styles.numberField}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
        />

        <TextField
          label={OPUS_DETAILS_LABELS.additionalText}
          value={value.additionalText}
          onChange={(event) => updateField('additionalText', event.target.value)}
          sx={styles.noteField}
          slotProps={{ htmlInput: { maxLength: OPUS_FIELD_LIMITS.additionalText } }}
        />
      </Box>

      <TextField
        label={`${OPUS_DETAILS_LABELS.name} *`}
        value={value.name}
        onChange={(event) => updateField('name', event.target.value)}
        error={Boolean(errors.name)}
        helperText={errors.name}
        sx={styles.titleField}
        slotProps={{ htmlInput: { maxLength: OPUS_FIELD_LIMITS.name.max } }}
      />

      <Box sx={styles.fieldsRow}>
        <YearPicker
          label={`${OPUS_DETAILS_LABELS.creationYear} *`}
          value={value.creationYear}
          onChange={(year) => updateField('creationYear', year)}
          error={Boolean(errors.creationYear)}
          helperText={errors.creationYear}
          sx={styles.field}
        />
        <Box sx={styles.yearSeparator}>–</Box>
        <YearPicker
          label={OPUS_DETAILS_LABELS.endYear}
          value={value.endYear}
          onChange={(year) => updateField('endYear', year)}
          sx={styles.field}
        />
        <TextField
          label={OPUS_DETAILS_LABELS.datesNote}
          value={value.datesNote}
          onChange={(event) => updateField('datesNote', event.target.value)}
          sx={styles.field}
          slotProps={{ htmlInput: { maxLength: OPUS_FIELD_LIMITS.datesNote } }}
        />
        <TextField
          label={OPUS_DETAILS_LABELS.genre}
          value={value.genre}
          onChange={(event) => updateField('genre', event.target.value)}
          sx={styles.genreField}
          slotProps={{ htmlInput: { maxLength: OPUS_FIELD_LIMITS.genre } }}
        />
      </Box>

      <GroupWorksSection
        works={value.compositions}
        onChange={(compositions) => updateField('compositions', compositions)}
      />
    </Box>
  );
}
