import { SxProps, Theme } from '@mui/material';

import { SIDEBAR_WIDTH } from '~/shared/components/file-info-sidebar/FileInfoSidebar.styles';
import { mainHexPalette as colors } from '~/shared/theme/colors';

type FilesPageContentStyles = {
  pageHeaderButton: SxProps<Theme>;
  contentLayout: SxProps<Theme>;
  filesArea: SxProps<Theme>;
};

export const styles: FilesPageContentStyles = {
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
  },

  contentLayout: {
    width: '100%',
    minWidth: 0
  },

  filesArea: {
    minWidth: 0
  }
};

export const getFilePageContentWrapper = (hasSidebarFile: boolean): SxProps<Theme> => ({
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  pr: { xs: 0, lg: hasSidebarFile ? `${SIDEBAR_WIDTH + 24}px` : 0 },
  transition: 'padding-right 0.2s ease'
});
