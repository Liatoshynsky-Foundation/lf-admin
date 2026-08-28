import { Box, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { ReactNode } from 'react';

import { CustomTextField } from '~/ds-components/text-field/TextField';

type SelectTextFieldProps<T> = Readonly<{
  options: readonly T[];
  selectValue: string;
  textValue: string;
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => ReactNode;
  renderSelectedValue?: (value: string) => ReactNode;
  selectAriaLabel: string;
  textFieldLabel: string;
  onSelectChange: (value: string) => void;
  onTextChange: (value: string) => void;
  required?: boolean;
}>;

export function SelectTextField<T>({
  options,
  selectValue,
  textValue,
  getOptionValue,
  getOptionLabel,
  renderSelectedValue,
  selectAriaLabel,
  textFieldLabel,
  onSelectChange,
  onTextChange,
  required = false
}: SelectTextFieldProps<T>) {
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    onSelectChange(event.target.value);
  };

  return (
    <Box display="flex" alignItems="flex-start" gap={1.5}>
      <Select
        value={selectValue}
        onChange={handleSelectChange}
        renderValue={renderSelectedValue}
        inputProps={{ 'aria-label': selectAriaLabel }}
      >
        {options.map((option) => {
          const value = getOptionValue(option);

          return (
            <MenuItem key={value} value={value}>
              {getOptionLabel(option)}
            </MenuItem>
          );
        })}
      </Select>
      <CustomTextField
        label={textFieldLabel}
        value={textValue}
        onChange={(event) => onTextChange(event.target.value)}
        sx={{ flex: 1 }}
        required={required}
        fullWidth
      />
    </Box>
  );
}
