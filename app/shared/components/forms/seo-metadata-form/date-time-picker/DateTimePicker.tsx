import 'dayjs/locale/uk';
import { Box } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useCallback } from 'react';

import { styles } from './DateTimePicker.style';

interface DateTimePickerProps {
  startDateTime?: string;
  endDateTime?: string;
  onChange: (start: string | undefined, end: string | undefined) => void;
  labels?: {
    startDateTime?: string;
    endDateTime?: string;
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
  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ width: '45%' }}>
            <DesktopDateTimePicker
              label={labels.startDateTime || 'Початок події'}
              value={startDateTime ? dayjs(startDateTime) : null}
              onChange={handleStartChange}
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
              label={labels.endDateTime || 'Закінчення події'}
              value={endDateTime ? dayjs(endDateTime) : null}
              onChange={handleEndChange}
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
  );
}
