import 'dayjs/locale/en';
import 'dayjs/locale/uk';
import { Box, FormHelperText } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useCallback } from 'react';

import { styles } from './DateTimePicker.style';
import { seoFormErrors } from '~/constants/errors';

const FALLBACK_LABELS = {
  startDateTime: 'Event start',
  endDateTime: 'Event end'
} as const;

export interface DateTimePickerProps {
  readonly startDateTime?: string;
  readonly endDateTime?: string;
  readonly onChange: (start: string | undefined, end: string | undefined) => void;
  readonly forceShowErrors?: boolean;
  readonly onStartBlur?: () => void;
  readonly locale?: 'uk' | 'en';
  readonly labels?: {
    readonly startDateTime?: string;
    readonly endDateTime?: string;
  };
}

export default function DateTimePicker({
  startDateTime,
  endDateTime,
  onChange,
  forceShowErrors = false,
  onStartBlur,
  locale = 'uk',
  labels = {}
}: DateTimePickerProps) {
  const errors = seoFormErrors[locale];
  const startLabel = labels.startDateTime ?? FALLBACK_LABELS.startDateTime;
  const endLabel = labels.endDateTime ?? FALLBACK_LABELS.endDateTime;

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
  const startRequiredError = forceShowErrors && !startDateTime;
  const startHelperText = startRequiredError ? errors.required : undefined;
  const endHelperText = endBeforeStart ? errors.endBeforeStart : undefined;

  const renderPicker = (
    value?: string,
    label?: string,
    onChangeCb?: (val: dayjs.Dayjs | null) => void,
    extraProps?: {
      minDateTime?: dayjs.Dayjs;
      onClose?: () => void;
      slotProps?: { textField?: Record<string, unknown> };
    }
  ) => {
    const { slotProps: extraSlotProps, ...restExtra } = extraProps ?? {};
    const textFieldSlot = extraSlotProps?.textField ?? {};
    const hasError = Boolean(textFieldSlot.error);

    return (
      <DesktopDateTimePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={onChangeCb}
        ampm={false}
        {...restExtra}
        slotProps={{
          popper: { sx: styles.popper },
          day: { sx: styles.day },
          textField: {
            sx: {
              ...styles.textField,
              '& label': {
                ...styles.datetimePickerLabel,
                ...(hasError ? { color: 'error.main' } : {})
              }
            },
            InputProps: { sx: styles.dateTimePickerInput },
            ...textFieldSlot
          }
        }}
      />
    );
  };

  return (
    <Box sx={styles.wrapper}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
        <Box sx={styles.container}>
          <Box sx={styles.field}>
            {renderPicker(startDateTime, startLabel, handleStartChange, {
              onClose: onStartBlur,
              slotProps: {
                textField: {
                  required: true,
                  error: startRequiredError,
                  onBlur: onStartBlur
                }
              }
            })}
            {startHelperText ? (
              <FormHelperText error data-testid="start-date-error">
                {startHelperText}
              </FormHelperText>
            ) : null}
          </Box>
          <Box sx={styles.separator}>—</Box>
          <Box sx={styles.field}>
            {renderPicker(endDateTime, endLabel, handleEndChange, {
              minDateTime: startDateTime ? dayjs(startDateTime) : undefined,
              slotProps: {
                textField: {
                  error: endBeforeStart
                }
              }
            })}
            {endHelperText ? (
              <FormHelperText error data-testid="end-date-error">
                {endHelperText}
              </FormHelperText>
            ) : null}
          </Box>
        </Box>
      </LocalizationProvider>
    </Box>
  );
}
