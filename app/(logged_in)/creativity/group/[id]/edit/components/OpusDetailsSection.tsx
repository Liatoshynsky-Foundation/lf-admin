import { Box, Divider, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';

type MultilingualText = { uk: string; en: string };

type OpusDetailsSectionProps = {
  data: {
    titlePrefix: string;
    opusNumber: string;
    additionalText: string;
    opusTitle: MultilingualText;
    creationDate: string;
    genre: MultilingualText;
  };
  currentLanguage: string;
  onChange: (field: string, value: string, isMultilingual?: boolean) => void;
};

export const OpusDetailsSection = ({ data, currentLanguage, onChange }: OpusDetailsSectionProps) => {
  const langKey = currentLanguage === 'UA' ? 'uk' : 'en';

  return (
    <CollapsibleBlock title="Деталі" defaultExpanded>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              lineHeight: '130%',
              letterSpacing: '0.17px'
            }}
            color="text.secondary"
          >
            Поля заповняються автоматично
          </Typography>

          <Divider sx={{ flexGrow: 1, borderColor: '#E0E2E8' }} />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, width: '50%' }}>
          <Box sx={{ flex: 3 }}>
            <CustomTextField
              label="Назва"
              value={data.titlePrefix}
              InputProps={{
                readOnly: true
              }}
              required
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 3 }}>
            <CustomTextField
              type="number"
              label="Номер"
              value={data.opusNumber}
              onChange={(e) => onChange('opusNumber', e.target.value)}
              required
              fullWidth
              sx={{
                '& input[type=number]': {
                  MozAppearance: 'textfield'
                },
                '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0
                }
              }}
            />
          </Box>
          <Box sx={{ flex: 4 }}>
            <CustomTextField
              label="Додатковий текст"
              value={data.additionalText}
              onChange={(e) => onChange('additionalText', e.target.value)}
              fullWidth
            />
          </Box>
        </Box>

        <CustomTextField
          label="Назва опусу"
          value={data.opusTitle[langKey]}
          onChange={(e) => onChange('opusTitle', e.target.value, true)}
          required
          fullWidth
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1.6 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Дата створення"
                views={['year']}
                value={data.creationDate ? dayjs(data.creationDate) : null}
                onChange={(newValue: Dayjs | null) => {
                  const formattedYear = newValue ? newValue.format('YYYY') : '';
                  onChange('creationDate', formattedYear);
                }}
                slotProps={{
                  textField: {
                    sx: {
                      '& .MuiPickersInputBase-root': {
                        borderRadius: '8px',
                        height: 48
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'black'
                      },
                      '& .MuiInputLabel-root:not(.MuiInputLabel-shrunk)': {
                        top: '-3px'
                      },
                      '& .MuiInputAdornment-root': {
                        display: 'none'
                      },
                      width: '100%',
                      borderRadius: '8px',
                      '& .MuiPickersOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline':
                        {
                          borderColor: 'black',
                          borderWidth: '1px'
                        }
                    },
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
          <Box sx={{ flex: 9.4 }}>
            <CustomTextField
              label="Жанр"
              value={data.genre[langKey]}
              onChange={(e) => onChange('genre', e.target.value, true)}
              required
              fullWidth
            />
          </Box>
        </Box>
      </Box>
    </CollapsibleBlock>
  );
};
