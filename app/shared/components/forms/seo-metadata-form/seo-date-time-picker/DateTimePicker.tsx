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

  const endBeforeStart =
    Boolean(startDateTime) && Boolean(endDateTime) && dayjs(endDateTime).isBefore(dayjs(startDateTime));

  const renderPicker = (
    value?: string,
    label?: string,
    onChangeCb?: (val: dayjs.Dayjs | null) => void,
    extraProps?: object
  ) => (
    <DesktopDateTimePicker
      label={label}
      value={value ? dayjs(value) : null}
      onChange={onChangeCb}
      ampm={false}
      {...extraProps}
      slotProps={{
        popper: { sx: styles.popper },
        day: { sx: styles.day },
        textField: {
          sx: {
            ...styles.textField,
            '& label': styles.datetimePickerLabel
          },
          InputProps: { sx: styles.dateTimePickerInput }
        }
      }}
    />
  );

  return (
    <Box sx={styles.wrapper}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
        <Box sx={styles.container}>
          <Box>{renderPicker(startDateTime, labels.startDateTime || 'Початок події', handleStartChange)}</Box>
          <Box
            sx={styles.separator}
          >
            —
          </Box>
          <Box>
            {renderPicker(endDateTime, labels.endDateTime || 'Закінчення події', handleEndChange, {
              minDateTime: startDateTime ? dayjs(startDateTime) : undefined,
              slotProps: {
                textField: {
                  error: endBeforeStart,
                  helperText: endBeforeStart ? 'Дата кінця не може бути раніше дати початку' : undefined
                }
              }
            })}
          </Box>
        </Box>
      </LocalizationProvider>
    </Box>
  );
}
