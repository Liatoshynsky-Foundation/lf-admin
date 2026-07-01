'use client';

import 'dayjs/locale/uk';
import { IconButton, InputAdornment, type SxProps, type Theme } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { Calendar } from 'lucide-react';
import { ReactElement, useState } from 'react';

import { OPUS_YEAR_RANGE } from '~/constants/opus';

const MIN_YEAR_DATE = dayjs(`${OPUS_YEAR_RANGE.min}-01-01`);
const MAX_YEAR_DATE = dayjs(`${OPUS_YEAR_RANGE.max}-12-31`);

const yearToValue = (year: string): Dayjs | null => {
  const parsed = Number(year);

  return year && Number.isInteger(parsed) ? dayjs(`${parsed}-01-01`) : null;
};

const valueToYear = (value: Dayjs | null): string => (value && value.isValid() ? String(value.year()) : '');

interface YearPickerProps {
  label: string;
  value: string;
  onChange: (year: string) => void;
  error?: boolean;
  helperText?: string;
  sx?: SxProps<Theme>;
}

export default function YearPicker({
  label,
  value,
  onChange,
  error,
  helperText,
  sx
}: Readonly<YearPickerProps>): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
      <DatePicker
        label={label}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        views={['year']}
        openTo="year"
        disableOpenPicker
        enableAccessibleFieldDOMStructure={false}
        minDate={MIN_YEAR_DATE}
        maxDate={MAX_YEAR_DATE}
        value={yearToValue(value)}
        onChange={(newValue) => onChange(valueToYear(newValue))}
        slotProps={{
          textField: {
            error,
            helperText,
            onClick: () => setOpen(true),
            sx,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton edge="start" size="small" aria-label="Відкрити календар" onClick={() => setOpen(true)}>
                    <Calendar size={18} strokeWidth={1.5} />
                  </IconButton>
                </InputAdornment>
              )
            }
          }
        }}
      />
    </LocalizationProvider>
  );
}
