import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },

  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    mx: '32px',
    mt: '16px',
    mb: '32px',
    alignSelf: 'stretch',
    boxSizing: 'border-box',
    minWidth: 0
  },

  detailsAccordion: {
    border: '0.5px solid',
    borderColor: 'blue.200',
    borderRadius: '20px',
    backgroundColor: 'white',
    boxShadow: 'none',
    '&:before': { display: 'none' },
    '&.MuiAccordion-root': { borderRadius: '20px' }
  },

  detailsSummary: {
    padding: '24px',
    '& .MuiAccordionSummary-content': { margin: 0 }
  },

  detailsTitle: {
    lineHeight: '1.2',
    fontWeight: 700
  },

  detailsContent: {
    padding: '0 24px 24px'
  },

  seoWrapper: {
    padding: '8px 0'
  }
};
