import { SxProps } from '@mui/material';

export const FilterSelectColors = {
  text: '#190D03',
  bgFilledDefault: '#D9DCE8',
  bgFilledDisabled: '#F7F8FC',
  chipBg: '#fff',
  textDisabled: '#63666E',
  borderOutlined: '#190D03',
  borderDisabled: '#D9D9D9'
};

function getBackgroundColor(variant: 'filled' | 'outlined', disabled: boolean): string {
  if (disabled) return FilterSelectColors.bgFilledDisabled;
  if (variant === 'outlined') return 'transparent';
  return FilterSelectColors.bgFilledDefault;
}

function getBorder(variant: 'filled' | 'outlined', disabled: boolean): string {
  if (variant !== 'outlined') return 'none';
  const borderColor = disabled ? FilterSelectColors.borderDisabled : FilterSelectColors.borderOutlined;
  return `1px solid ${borderColor}`;
}

export const filterSelectStyles = {
  root: (variant: 'filled' | 'outlined', disabled: boolean): SxProps => {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '40px',
      gap: '12px',
      borderRadius: '8px',
      padding: '6px 12px 6px 16px',
      backgroundColor: getBackgroundColor(variant, disabled),
      border: getBorder(variant, disabled),
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s',

      fontFamily: 'Mulish',
      fontWeight: 600,
      fontSize: '16px',
      lineHeight: '150%',
      letterSpacing: '0%',
      minWidth: '136px',
    };
  },

  label: (disabled: boolean): SxProps => ({
    fontFamily: 'Mulish',
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: '150%',
    letterSpacing: '0%',
    color: disabled ? FilterSelectColors.textDisabled : FilterSelectColors.text
  }),

  chipContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: '1 1 auto',
    minWidth: 0,
    justifyContent: 'flex-end',
    width: 'auto'
  },

  selectedOptionsChip: (disabled: boolean): SxProps => ({
    backgroundColor: FilterSelectColors.chipBg,
    height: '28px',
    borderRadius: '20px',
    marginRight: 'auto',
    maxWidth: '260px',
    py: '8px',
    px: '4px',
    '& .MuiChip-label': {
      color: disabled ? FilterSelectColors.textDisabled : FilterSelectColors.text,
      fontFamily: 'Mulish',
      fontWeight: 600,
      fontSize: '16px',
      fontStyle: 'italic',
      lineHeight: '150%',
      letterSpacing: '0%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      padding: '0 8px'
    },
    '& .MuiChip-deleteIcon': {
      color: disabled ? FilterSelectColors.textDisabled : FilterSelectColors.text,
      width: '16px',
      height: '16px',
      margin: '2px 9px 0 -2px',
      flexShrink: 0
    },
    '& .MuiChip-deleteIcon:hover': {
      color: disabled ? FilterSelectColors.textDisabled : FilterSelectColors.text
    }
  }),

  chipList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    flex: 1
  },

  placeholderChip: {
    pointerEvents: 'none',
    opacity: 0.7,
    flex: 1
  },

  dropdownIcon: (disabled: boolean): SxProps => ({
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: disabled ? FilterSelectColors.textDisabled : FilterSelectColors.text
  }),

  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    fontFamily: 'Mulish',
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: '150%',
    letterSpacing: '0%'
  },

  clearAllContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  }
};
