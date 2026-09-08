import { SxProps, Theme } from '@mui/material';

export const styles = {
  contributorContainer: {
    display: 'flex'
  },
  svgContainer: {
    mt: '16px',
    ml: '8px',
    width: '40px',
    height: '40px'
  },
  contributorsTitle: {
    color: 'blue.800'
  },
  teamBlock: {
    mt: '16px',
    width: '1098px'
  },
  contributorBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  addBtn: {
    maxWidth: '250px',
    alignSelf: 'flex-start'
  },
  mainStack: {
    p: '16px 32px 32px 32px'
  },
  introBlock: {
    mb: 4,
    '&.Mui-expanded': {
      mb: 4
    }
  },
  titleTextField: {
    mb: 3,
    mt: '4px'
  },
  configListAddBtn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  memberBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  sectionDivider: {
    mt: 1
  }
} satisfies Record<string, SxProps<Theme>>;
