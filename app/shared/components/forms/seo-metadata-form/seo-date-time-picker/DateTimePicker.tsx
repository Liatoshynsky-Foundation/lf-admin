import 'dayjs/locale/uk';
import { Box } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useCallback } from 'react';

import { styles } from './DateTimePicker.style';

export interface DateTimePickerProps {
  readonly startDateTime?: string;
  readonly endDateTime?: string;
  readonly onChange: (start: string | undefined, end: string | undefined) => void;
  readonly labels?: {
    readonly startDateTime?: string;
    readonly endDateTime?: string;
  };
}

export default function DateTimePicker({ startDateTime, endDateTime, onChange, labels = {} }: DateTimePickerProps) {
  const handleStartChange = useCallback(
    (newValue: dayjs.Dayjs | null) => {
      onChange(newValue ? newValue.toISOString() : undefined, endDateTime);
    },
    [onChange, endDateTime]
  );

  const handleEndChange = useCallback(
    (newValue: dayjs.Dayjs | null) => {
      onChange(startDateTime, newValue ? newValue.toISOString() : undefined);
    },
    [onChange, startDateTime]
  );

  const renderPicker = (value?: string, label?: string, onChangeCb?: (val: dayjs.Dayjs | null) => void) => (
    <DesktopDateTimePicker
      label={label}
      value={value ? dayjs(value) : null}
      onChange={onChangeCb}
      ampm={false}
      sx={{
        '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
          borderColor: '#ADAEBA',
          borderWidth: '1px',
          borderStyle: 'solid'
        },
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(25, 13, 3, 0.5)'
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#190D03',
          borderWidth: '1px'
        },
        '& .MuiOutlinedInput-root:focus-within .MuiOutlinedInput-notchedOutline': {
          borderColor: '#190D03',
          borderWidth: '1px'
        },
        '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(25, 13, 3, 0.25)'
        },
        '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: '#E63C14'
        }
      }}
      slotProps={{
        popper: {
          sx: {
            '& .MuiMultiSectionDigitalClockSection-item.Mui-selected': {
              backgroundColor: '#FCBD28',
              color: '#190D03'
            },
            '& .MuiMultiSectionDigitalClockSection-item.Mui-selected:hover': {
              backgroundColor: '#FCBD28'
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
            '& label': { sx: styles.datetimePickerLabel },
            width: { sm: '200px', xl: '223px' }
          },
          InputProps: { sx: styles.dateTimePicker }
        }
      }}
    />
  );

  return (
    <Box sx={{ width: '100%' }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ width: '45%' }}>
            {renderPicker(startDateTime, labels.startDateTime || 'Початок події', handleStartChange)}
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
            {renderPicker(endDateTime, labels.endDateTime || 'Закінчення події', handleEndChange)}
          </Box>
        </Box>
      </LocalizationProvider>
    </Box>
  );
}
