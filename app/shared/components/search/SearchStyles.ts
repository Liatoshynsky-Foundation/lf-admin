import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import { colors } from '~/shared/components/design-system/button/Button.styles';

export const CustomBorderTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: colors.black
    },
    '&:hover fieldset': {
      borderColor: colors.black
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.black
    }
  }
});

export const SearchStyles = {
  icon: {
    padding: 8,
    height: 40,
    overflow: 'hidden'
  },
  list: {
    width: '280px'
  },
  listbox: {
    padding: 0,
    margin: 0,
    overflow: 'hidden',
    maxHeight: 'none'
  }
};

export const iconStyles = {
  height: '24px',
  cursor: 'pointer'
};
