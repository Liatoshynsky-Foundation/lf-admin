export const customTooltipStyles = {
  tooltip: {
    sx: {
      backgroundColor: '#3F444A',
      fontFamily: 'Mulish',
      fontWeight: 400,
      fontStyle: 'italic',
      fontSize: '14px',
      lineHeight: '140%',
      letterSpacing: 0,
      textAlign: 'center',
      color: '#FCFCFC',
      padding: '4px 16px',
      borderRadius: '20px',
      boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.07)',
      '& .MuiTooltip-arrow': {
        color: '#3F444A'
      }
    }
  } as const
};
