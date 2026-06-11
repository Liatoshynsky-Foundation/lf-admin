import { SxProps, Theme } from '@mui/material';

import type { LogLevel } from '~/back-shared/types/logs';

const LEVEL_ACCENTS = {
  error: {
    border: 'rgba(211, 47, 47, 0.28)',
    background: 'rgba(211, 47, 47, 0.05)'
  },
  warn: {
    border: 'rgba(237, 108, 2, 0.28)',
    background: 'rgba(237, 108, 2, 0.05)'
  },
  info: {
    border: 'rgba(2, 136, 209, 0.28)',
    background: 'rgba(2, 136, 209, 0.05)'
  },
  debug: {
    border: 'rgba(97, 97, 97, 0.28)',
    background: 'rgba(97, 97, 97, 0.05)'
  }
} satisfies Record<LogLevel, { border: string; background: string }>;

export const styles = {
  jsonBlock: {
    m: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: 13
  },
  accordionSummary: {
    px: 2
  },
  accordionDetails: {
    px: 2,
    pb: 2
  },
  typographyText: {
    flexGrow: 1,
    fontWeight: 700
  },
  pageTitle: {
    fontWeight: 800
  },
  tabsContainer: {
    borderBottom: 1,
    borderColor: 'divider'
  },
  clearLogsButton: {
    backgroundColor: 'common.black',
    color: 'common.white',
    '&:hover': { backgroundColor: 'common.black' }
  }
} satisfies Record<string, SxProps<Theme>>;

export const getLogItemAccordion = (level: LogLevel): SxProps<Theme> => ({
  borderRadius: 2,
  overflow: 'hidden',
  border: `1px solid ${LEVEL_ACCENTS[level].border}`,
  backgroundColor: LEVEL_ACCENTS[level].background,
  '&:before': { display: 'none' }
});
