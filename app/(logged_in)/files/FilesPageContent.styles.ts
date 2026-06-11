import { SxProps, Theme } from '@mui/material';

import { SIDEBAR_WIDTH } from '~/shared/components/file-info-sidebar/FileInfoSidebar.styles';
import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  pageHeaderButton: {
    borderRadius: '20px',
    px: '24px',
    py: '8px',
    minHeight: '40px',
    textTransform: 'none',
    color: colors.black,
    boxShadow: 'none',
    fontSize: '16px',
    lineHeight: 1.5,
    bgcolor: colors.yellow[500],
    '&:hover': {
      bgcolor: colors.yellow[600],
      boxShadow: 'none'
    }
  }
} satisfies Record<string, SxProps<Theme>>;

export const getFilePageContentWrapper = (hasSidebarFile: boolean): SxProps<Theme> => ({
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  pr: { xs: 0, md: hasSidebarFile ? `${SIDEBAR_WIDTH}px` : 0 },
  transition: 'padding-right 0.2s ease'
});
